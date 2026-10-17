'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { AdminFiltersCard, AdminHeaderCard } from '@/features/admin/components/admin-section';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import { DocumentsTable } from '@/features/admin/components/documents-table';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import { pollDocumentsUntilSettled } from '@/features/admin/lib/document-polling';
import { useDebouncedSearch } from '@/features/admin/lib/use-debounced-search';
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
  q: string;
  page: number;
}

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 15;

function formatPage(template: string, page: number, totalPages: number): string {
  return template.replace('{page}', String(page)).replace('{totalPages}', String(totalPages));
}

/**
 * Documents list: ingestion now lives in the `documentos/nuevo` wizard
 * (single "Subir" button above), so this view only renders filters, the
 * table with bounded polling for transient ingestion states, re-ingest
 * and soft delete. The rows are server-fetched (URL-driven status filter
 * + pagination); this component keeps a local copy so polling and
 * mutations update in place without a full navigation.
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
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [stoppedIds, setStoppedIds] = useState<ReadonlySet<string>>(new Set());
  const [confirmReingestId, setConfirmReingestId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ ok: boolean; text: string } | null>(null);

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
      ...(merged.q === '' ? {} : { q: merged.q }),
      page: merged.page,
    });
    // Sin scroll al principio: los filtros y la paginación viven junto a la
    // tabla y la página remonta la vista en el mismo sitio (clave por
    // filtro+página), así que conservar la posición evita perder la tabla.
    router.push(`/${locale}/admin/documentos${search}`, { scroll: false });
  }

  /**
   * Title search, like the categories name filter: it applies while typing.
   * Documents are server-paginated, so keystrokes are debounced into a
   * single URL navigation (the page remounts this view, resetting the draft
   * from the new query).
   */
  const {
    draft,
    handleChange: handleDraftChange,
    handleEnter: applyDraftNow,
    reset: resetDraft,
  } = useDebouncedSearch(query.q, (trimmed) => {
    navigate({ q: trimmed, page: 1 });
  });

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
      <AdminHeaderCard
        title={docs.title}
        subtitle={docs.subtitle}
        actions={<Button href={`/${locale}/admin/documentos/nuevo`}>{docs.uploadAction}</Button>}
      />

      <AdminFiltersCard>
        <div className="min-w-56">
          <Input
            label={docs.searchPlaceholder}
            name="q"
            value={draft}
            onChange={(event) => {
              handleDraftChange(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') applyDraftNow();
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
        <Button
          variant="secondary"
          onClick={() => {
            resetDraft();
            navigate({ status: '', type: '', q: '', page: 1 });
          }}
        >
          {messages.catalog.clearFilters}
        </Button>
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
            filtered={query.status !== '' || query.type !== '' || query.q !== ''}
            clearFiltersLabel={messages.catalog.clearFilters}
            onReingest={(id) => {
              setConfirmReingestId(id);
            }}
            onDelete={(id) => {
              setConfirmDeleteId(id);
            }}
            onClearFilters={() => {
              resetDraft();
              navigate({ status: '', type: '', q: '', page: 1 });
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

      <Stack direction="horizontal" gap="md" align="center" justify="center">
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
