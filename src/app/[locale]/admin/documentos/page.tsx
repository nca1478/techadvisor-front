import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  AdminDocumentsView,
  type AdminDocumentsQuery,
} from '@/features/admin/containers/admin-documents-view';
import { backendFetch } from '@/lib/api/backend';
import type { AdminDocumentList, AdminDocumentStatus, AdminDocumentType } from '@/lib/api/admin';
import { ADMIN_DOCUMENT_TYPES, toAdminQuery } from '@/lib/api/admin';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface DocumentsPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

export async function generateMetadata({ params }: DocumentsPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.documents.title} — ${messages.common.techAdvisor}` };
}

const STATUSES: AdminDocumentStatus[] = ['PENDING', 'PROCESSING', 'READY', 'FAILED'];

function firstParam(query: Record<string, unknown>, key: string): string {
  const value = query[key];
  return typeof value === 'string' ? value : '';
}

function isDocumentList(value: unknown): value is AdminDocumentList {
  return (
    value !== null && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)
  );
}

/** Corpus documents: URL-driven status filter + pagination, server-fetched. */
export default async function AdminDocumentsPage({ params, searchParams }: DocumentsPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const queryParams = ((await searchParams) ?? {}) as Record<string, unknown>;

  const rawStatus = firstParam(queryParams, 'status');
  const status: AdminDocumentsQuery['status'] = (STATUSES as readonly string[]).includes(rawStatus)
    ? (rawStatus as AdminDocumentStatus)
    : '';
  const rawType = firstParam(queryParams, 'type');
  const type: AdminDocumentsQuery['type'] = (ADMIN_DOCUMENT_TYPES as readonly string[]).includes(
    rawType,
  )
    ? (rawType as AdminDocumentType)
    : '';
  const page = Math.max(1, Number.parseInt(firstParam(queryParams, 'page'), 10) || 1);

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  const search = toAdminQuery({
    ...(status === '' ? {} : { status }),
    ...(type === '' ? {} : { type }),
    page,
    limit: 10,
  });
  const result = await backendFetch(`/admin/documents${search}`, { method: 'GET', cookieHeader });
  const data = result.status === 200 && isDocumentList(result.body) ? result.body : null;

  return (
    <AdminDocumentsView
      key={`${status}-${type}-${String(page)}`}
      data={data}
      loadError={data === null}
      query={{ status, type, page }}
      locale={locale}
      messages={messages}
      initialTitle={firstParam(queryParams, 'title').slice(0, 200)}
    />
  );
}
