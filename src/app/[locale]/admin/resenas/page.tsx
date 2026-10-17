import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  AdminReviewsView,
  type AdminReviewsQuery,
} from '@/features/admin/containers/admin-reviews-view';
import { backendFetch } from '@/lib/api/backend';
import type { AdminReviewList, AdminReviewStatus } from '@/lib/api/admin';
import { ADMIN_REVIEW_STATUSES } from '@/lib/api/admin';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface ReviewsPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

export async function generateMetadata({ params }: ReviewsPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.reviews.title} — ${messages.common.techAdvisor}` };
}

function firstParam(query: Record<string, unknown>, key: string): string {
  const value = query[key];
  return typeof value === 'string' ? value : '';
}

function isReviewList(value: unknown): value is AdminReviewList {
  return (
    value !== null && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)
  );
}

/** Back-office review moderation: URL-driven status filter + pagination, server-fetched. */
export default async function AdminReviewsPage({ params, searchParams }: ReviewsPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const queryParams = ((await searchParams) ?? {}) as Record<string, unknown>;

  const rawStatus = firstParam(queryParams, 'status');
  const status: AdminReviewsQuery['status'] = (ADMIN_REVIEW_STATUSES as readonly string[]).includes(
    rawStatus,
  )
    ? (rawStatus as AdminReviewStatus)
    : '';
  const page = Math.max(1, Number.parseInt(firstParam(queryParams, 'page'), 10) || 1);
  const q = firstParam(queryParams, 'q').trim().slice(0, 100);

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  const search = new URLSearchParams();
  if (status !== '') search.set('status', status);
  if (q !== '') search.set('q', q);
  search.set('page', String(page));
  search.set('limit', '10');
  const result = await backendFetch(`/admin/reviews?${search.toString()}`, {
    method: 'GET',
    cookieHeader,
  });
  const data = result.status === 200 && isReviewList(result.body) ? result.body : null;

  return (
    <AdminReviewsView
      key={`${status}-${q}-${String(page)}`}
      data={data}
      loadError={data === null}
      query={{ status, q, page }}
      locale={locale}
      messages={messages}
    />
  );
}
