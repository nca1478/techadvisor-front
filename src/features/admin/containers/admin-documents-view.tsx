'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { AdminFiltersCard, AdminHeaderCard } from '@/features/admin/components/admin-section';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import { DocumentsTable } from '@/features/admin/components/documents-table';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import {
  isHttpUrl,
  isOptionalUuid,
  validateUploadFile,
  type UploadFileError,
} from '@/features/admin/lib/document-upload';
import { pollDocumentsUntilSettled } from '@/features/admin/lib/document-polling';
import type {
  AdminDocument,
  AdminDocumentList,
  AdminDocumentStatus,
  AdminDocumentType,
} from '@/lib/api/admin';
import { ADMIN_DOCUMENT_TYPES, isDocumentProcessing, toAdminQuery } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

export interface AdminDocumentsQuery {
  status: AdminDocumentStatus | '';
  type: AdminDocumentType | '';
  page: number;
}

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 15;

const FILE_ERROR_KEYS: Record<UploadFileError, 'fileRequired' | 'fileTooLarge' | 'fileTypeHint'> = {
  required: 'fileRequired',
  'too-large': 'fileTooLarge',
  type: 'fileTypeHint',
};

function formatPage(template: string, page: number, totalPages: number): string {
  return template.replace('{page}', String(page)).replace('{totalPages}', String(totalPages));
}

/**
 * Documents container: upload (file or URL), bounded polling for transient
 * ingestion states, re-ingest and soft delete. The list itself is
 * server-fetched (URL-driven status filter + pagination); this component
 * keeps a local copy of the rows so polling and mutations update in place
 * without a full navigation.
 */
export function AdminDocumentsView({
  data,
  loadError,
  query,
  locale,
  messages,
}: {
  data: AdminDocumentList | null;
  loadError: boolean;
  query: AdminDocumentsQuery;
  locale: string;
  messages: Dictionary;
}) {
  const router = useRouter();
  const docs = messages.admin.documents;
  const [rows, setRows] = useState<AdminDocument[]>(data?.data ?? []);
  const [file, setFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<AdminDocumentType>('MANUAL');
  const [uploadLocale, setUploadLocale] = useState('en');
  const [uploadProductId, setUploadProductId] = useState('');
  const [uploadCategoryId, setUploadCategoryId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [urlTitle, setUrlTitle] = useState('');
  const [urlType, setUrlType] = useState<AdminDocumentType>('MANUAL');
  const [urlLocale, setUrlLocale] = useState('en');
  const [sourceUrl, setSourceUrl] = useState('');
  const [registering, setRegistering] = useState(false);
  const [urlFeedback, setUrlFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [stoppedIds, setStoppedIds] = useState<ReadonlySet<string>>(new Set());
  const [confirmReingestId, setConfirmReingestId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [fileResetKey, setFileResetKey] = useState(0);

  const transientKey = useMemo(
    () =>
      rows
        .filter((row) => isDocumentProcessing(row.status))
        .map((row) => row.id)
        .sort()
        .join(','),
    [rows],
  );

  // Bounded polling for transient rows: refresh each detail until it
  // settles (READY/FAILED) or the attempt budget runs out (15 attempts
  // every 2 s), then a "reload" note instead of polling forever. The page
  // remounts this view on filter/pagination navigation (React `key`), so
  // `rows` only needs the server list as its initial state.
  useEffect(() => {
    if (transientKey === '') {
      return;
    }
    const ids = transientKey.split(',');
    let cancelled = false;
    void pollDocumentsUntilSettled(
      ids,
      async (id) => {
        try {
          return await adminHttp.get<AdminDocument>(`/documents/${encodeURIComponent(id)}`);
        } catch {
          // A deleted row 404s here: drop it from the list.
          return null;
        }
      },
      {
        onUpdate: (updated) => {
          setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
        },
        onMissing: (id) => {
          setRows((current) => current.filter((row) => row.id !== id));
        },
      },
      { intervalMs: POLL_INTERVAL_MS, maxAttempts: POLL_MAX_ATTEMPTS },
    )
      .then(({ pending }) => {
        if (cancelled) {
          return;
        }
        if (pending.length > 0) {
          setStoppedIds((current) => new Set([...current, ...pending]));
        }
      })
      .catch(() => {
        // Network blip: rows keep their last state and the next
        // transient change restarts polling; nothing to show.
      });
    return () => {
      cancelled = true;
    };
  }, [transientKey]);

  function navigate(next: Partial<AdminDocumentsQuery>) {
    const merged: AdminDocumentsQuery = { ...query, ...next };
    const search = toAdminQuery({
      ...(merged.status === '' ? {} : { status: merged.status }),
      ...(merged.type === '' ? {} : { type: merged.type }),
      page: merged.page,
    });
    router.push(`/${locale}/admin/documentos${search}`);
  }

  function upsertRow(document: AdminDocument) {
    setRows((current) => {
      if (current.some((row) => row.id === document.id)) {
        return current.map((row) => (row.id === document.id ? document : row));
      }
      return [document, ...current];
    });
  }

  function markPending(id: string, busy: boolean) {
    setPendingIds((current) => {
      const next = new Set(current);
      if (busy) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  async function handleUpload() {
    const fileError = validateUploadFile(file);
    if (fileError !== null) {
      setUploadFeedback({ ok: false, text: docs[FILE_ERROR_KEYS[fileError]] });
      return;
    }
    if (!isOptionalUuid(uploadProductId) || !isOptionalUuid(uploadCategoryId)) {
      setUploadFeedback({ ok: false, text: messages.admin.required });
      return;
    }
    setUploading(true);
    setUploadFeedback(null);
    try {
      const form = new FormData();
      form.set('file', file as File);
      if (uploadTitle.trim() !== '') {
        form.set('title', uploadTitle.trim());
      }
      form.set('type', uploadType);
      form.set('locale', uploadLocale);
      if (uploadProductId.trim() !== '') {
        form.set('productId', uploadProductId.trim());
      }
      if (uploadCategoryId.trim() !== '') {
        form.set('categoryId', uploadCategoryId.trim());
      }
      const created = await adminHttp.postForm<AdminDocument>('/documents/upload', form);
      upsertRow(created);
      setFile(null);
      setUploadTitle('');
      setFileResetKey((key) => key + 1);
      setUploadFeedback({ ok: true, text: docs.uploaded });
    } catch (error) {
      setUploadFeedback({ ok: false, text: adminErrorMessage(error, docs.uploadError) });
    } finally {
      setUploading(false);
    }
  }

  async function handleRegisterUrl() {
    if (urlTitle.trim() === '' || !isHttpUrl(sourceUrl)) {
      setUrlFeedback({
        ok: false,
        text: urlTitle.trim() === '' ? messages.admin.required : docs.urlInvalid,
      });
      return;
    }
    setRegistering(true);
    setUrlFeedback(null);
    try {
      const created = await adminHttp.post<AdminDocument>('/documents', {
        title: urlTitle.trim(),
        type: urlType,
        locale: urlLocale,
        sourceUrl: sourceUrl.trim(),
      });
      upsertRow(created);
      setUrlTitle('');
      setSourceUrl('');
      setUrlFeedback({ ok: true, text: docs.registered });
    } catch (error) {
      setUrlFeedback({ ok: false, text: adminErrorMessage(error, docs.registerError) });
    } finally {
      setRegistering(false);
    }
  }

  async function handleReingest(id: string) {
    markPending(id, true);
    setActionFeedback(null);
    try {
      const updated = await adminHttp.post<AdminDocument>(
        `/documents/${encodeURIComponent(id)}/reingest`,
      );
      upsertRow(updated);
      setConfirmReingestId(null);
      setActionFeedback({ ok: true, text: docs.reingested });
    } catch (error) {
      setActionFeedback({ ok: false, text: adminErrorMessage(error, docs.reingestError) });
      setConfirmReingestId(null);
    } finally {
      markPending(id, false);
    }
  }

  async function handleDelete(id: string) {
    markPending(id, true);
    setActionFeedback(null);
    try {
      await adminHttp.delete(`/documents/${encodeURIComponent(id)}`);
      setRows((current) => current.filter((row) => row.id !== id));
      setConfirmDeleteId(null);
      setActionFeedback({ ok: true, text: docs.deleted });
    } catch (error) {
      setActionFeedback({ ok: false, text: adminErrorMessage(error, docs.deleteError) });
      setConfirmDeleteId(null);
    } finally {
      markPending(id, false);
    }
  }

  const typeOptions = ADMIN_DOCUMENT_TYPES.map((value) => ({
    value,
    label: (docs as Record<string, string>)[`type_${value}`] ?? value,
  }));
  const statusOptions = [
    { value: '', label: docs.allStatuses },
    { value: 'PENDING', label: docs.status_PENDING },
    { value: 'PROCESSING', label: docs.status_PROCESSING },
    { value: 'READY', label: docs.status_READY },
    { value: 'FAILED', label: docs.status_FAILED },
  ];
  const documentTypeOptions = [{ value: '', label: docs.allTypes }, ...typeOptions];
  const totalPages = data?.totalPages ?? 1;
  const page = data?.page ?? query.page;

  return (
    <Stack gap="md">
      <AdminHeaderCard title={docs.title} subtitle={docs.subtitle} />

      <Card>
        <Stack gap="md">
          <Heading level={2}>{docs.uploadTitle}</Heading>
          <Input
            key={fileResetKey}
            label={docs.fileLabel}
            name="file"
            type="file"
            accept=".pdf,.html,.htm,.md,.markdown,.txt"
            hint={docs.fileHint}
            disabled={uploading}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
            }}
          />
          <Input
            label={docs.titleLabel}
            name="uploadTitle"
            value={uploadTitle}
            disabled={uploading}
            onChange={(event) => {
              setUploadTitle(event.target.value);
            }}
          />
          <Stack direction="horizontal" gap="md" wrap>
            <div className="min-w-44 flex-1">
              <Select
                label={docs.typeLabel}
                name="uploadType"
                value={uploadType}
                options={typeOptions}
                disabled={uploading}
                onChange={(event) => {
                  setUploadType(event.target.value as AdminDocumentType);
                }}
              />
            </div>
            <div className="min-w-44 flex-1">
              <Select
                label={docs.localeLabel}
                name="uploadLocale"
                value={uploadLocale}
                options={[
                  { value: 'en', label: 'en' },
                  { value: 'es', label: 'es' },
                ]}
                disabled={uploading}
                onChange={(event) => {
                  setUploadLocale(event.target.value);
                }}
              />
            </div>
          </Stack>
          <Stack direction="horizontal" gap="md" wrap>
            <div className="min-w-44 flex-1">
              <Input
                label={docs.productLabel}
                name="uploadProductId"
                value={uploadProductId}
                disabled={uploading}
                onChange={(event) => {
                  setUploadProductId(event.target.value);
                }}
              />
            </div>
            <div className="min-w-44 flex-1">
              <Input
                label={docs.categoryLabel}
                name="uploadCategoryId"
                value={uploadCategoryId}
                disabled={uploading}
                onChange={(event) => {
                  setUploadCategoryId(event.target.value);
                }}
              />
            </div>
          </Stack>
          <div>
            <Button
              variant="primary"
              disabled={uploading}
              onClick={() => {
                void handleUpload();
              }}
            >
              {uploading ? docs.uploading : docs.uploadSubmit}
            </Button>
          </div>
          {uploadFeedback ? (
            <Text
              role={uploadFeedback.ok ? 'status' : 'alert'}
              className={uploadFeedback.ok ? undefined : 'text-destructive'}
            >
              {uploadFeedback.text}
            </Text>
          ) : null}
        </Stack>
      </Card>

      <Card>
        <Stack gap="md">
          <Heading level={2}>{docs.urlTitle}</Heading>
          <Input
            label={docs.titleLabel}
            name="urlTitle"
            value={urlTitle}
            disabled={registering}
            onChange={(event) => {
              setUrlTitle(event.target.value);
            }}
          />
          <Input
            label={docs.urlLabel}
            name="sourceUrl"
            value={sourceUrl}
            placeholder="https://…"
            disabled={registering}
            onChange={(event) => {
              setSourceUrl(event.target.value);
            }}
          />
          <Stack direction="horizontal" gap="md" wrap>
            <div className="min-w-44 flex-1">
              <Select
                label={docs.typeLabel}
                name="urlType"
                value={urlType}
                options={typeOptions}
                disabled={registering}
                onChange={(event) => {
                  setUrlType(event.target.value as AdminDocumentType);
                }}
              />
            </div>
            <div className="min-w-44 flex-1">
              <Select
                label={docs.localeLabel}
                name="urlLocale"
                value={urlLocale}
                options={[
                  { value: 'en', label: 'en' },
                  { value: 'es', label: 'es' },
                ]}
                disabled={registering}
                onChange={(event) => {
                  setUrlLocale(event.target.value);
                }}
              />
            </div>
          </Stack>
          <div>
            <Button
              variant="secondary"
              disabled={registering}
              onClick={() => {
                void handleRegisterUrl();
              }}
            >
              {registering ? docs.registering : docs.urlSubmit}
            </Button>
          </div>
          {urlFeedback ? (
            <Text
              role={urlFeedback.ok ? 'status' : 'alert'}
              className={urlFeedback.ok ? undefined : 'text-destructive'}
            >
              {urlFeedback.text}
            </Text>
          ) : null}
        </Stack>
      </Card>

      <AdminFiltersCard>
        <div className="min-w-44">
          <Select
            label={docs.statusFilter}
            name="status"
            value={query.status}
            options={statusOptions}
            onChange={(event) => {
              navigate({ status: event.target.value as AdminDocumentsQuery['status'], page: 1 });
            }}
          />
        </div>
        <div className="min-w-44">
          <Select
            label={docs.typeLabel}
            name="type"
            value={query.type}
            options={documentTypeOptions}
            onChange={(event) => {
              navigate({ type: event.target.value as AdminDocumentsQuery['type'], page: 1 });
            }}
          />
        </div>
      </AdminFiltersCard>

      {loadError ? (
        <Text role="alert" className="text-destructive">
          {messages.admin.loadError}
        </Text>
      ) : (
        <Card padding="none">
          <DocumentsTable
            documents={rows}
            messages={docs}
            locale={locale}
            pendingIds={pendingIds}
            stoppedIds={stoppedIds}
            rowOffset={data ? (data.page - 1) * data.limit : 0}
            onReingest={(id) => {
              setConfirmReingestId(id);
            }}
            onDelete={(id) => {
              setConfirmDeleteId(id);
            }}
          />
        </Card>
      )}
      {actionFeedback ? (
        <Text
          role={actionFeedback.ok ? 'status' : 'alert'}
          className={actionFeedback.ok ? undefined : 'text-destructive'}
        >
          {actionFeedback.text}
        </Text>
      ) : null}

      <Stack direction="horizontal" gap="md" align="center">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => {
            navigate({ page: page - 1 });
          }}
        >
          {messages.admin.previous}
        </Button>
        <Text tone="muted">{formatPage(messages.admin.pageOf, page, totalPages)}</Text>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => {
            navigate({ page: page + 1 });
          }}
        >
          {messages.admin.next}
        </Button>
      </Stack>

      <ConfirmDialog
        open={confirmReingestId !== null}
        title={messages.admin.confirmTitle}
        body={docs.reingestConfirm}
        pending={confirmReingestId !== null && pendingIds.has(confirmReingestId)}
        messages={messages.admin}
        onConfirm={() => {
          if (confirmReingestId !== null) {
            void handleReingest(confirmReingestId);
          }
        }}
        onClose={() => {
          setConfirmReingestId(null);
        }}
      />
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title={messages.admin.confirmTitle}
        body={docs.deleteConfirm}
        pending={confirmDeleteId !== null && pendingIds.has(confirmDeleteId)}
        messages={messages.admin}
        onConfirm={() => {
          if (confirmDeleteId !== null) {
            void handleDelete(confirmDeleteId);
          }
        }}
        onClose={() => {
          setConfirmDeleteId(null);
        }}
      />
    </Stack>
  );
}
