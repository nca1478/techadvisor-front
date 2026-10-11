import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  AdminAdvisorView,
  type AdminAdvisorQuery,
} from '@/features/admin/containers/admin-advisor-view';
import { backendFetch } from '@/lib/api/backend';
import type {
  AdminAdvisorFeedbackList,
  AdminAdvisorMetrics,
  AdminFeedbackValue,
  AdminUnansweredGroupList,
  AdminUnansweredStatus,
} from '@/lib/api/admin';
import { ADMIN_FEEDBACK_VALUES, ADMIN_UNANSWERED_STATUSES } from '@/lib/api/admin';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface AdvisorPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

export async function generateMetadata({ params }: AdvisorPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.advisor.title} — ${messages.common.techAdvisor}` };
}

function firstParam(query: Record<string, unknown>, key: string): string {
  const value = query[key];
  return typeof value === 'string' ? value : '';
}

function isGroupList(value: unknown): value is AdminUnansweredGroupList {
  return (
    value !== null && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)
  );
}

function isFeedbackList(value: unknown): value is AdminAdvisorFeedbackList {
  return (
    value !== null && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)
  );
}

function isMetrics(value: unknown): value is AdminAdvisorMetrics {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as { openUnanswered?: unknown }).openUnanswered === 'number'
  );
}

/** Advisor improvement loop: metrics, frequency buckets, feedback (server-fetched, URL-driven). */
export default async function AdminAdvisorPage({ params, searchParams }: AdvisorPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const queryParams = ((await searchParams) ?? {}) as Record<string, unknown>;

  const rawStatus = firstParam(queryParams, 'status');
  const status: AdminAdvisorQuery['status'] = (
    ADMIN_UNANSWERED_STATUSES as readonly string[]
  ).includes(rawStatus)
    ? (rawStatus as AdminUnansweredStatus)
    : '';
  const gpage = Math.max(1, Number.parseInt(firstParam(queryParams, 'gpage'), 10) || 1);
  const rawValue = firstParam(queryParams, 'fvalue');
  const fvalue: AdminAdvisorQuery['fvalue'] = (ADMIN_FEEDBACK_VALUES as readonly string[]).includes(
    rawValue,
  )
    ? (rawValue as AdminFeedbackValue)
    : '';
  const fpage = Math.max(1, Number.parseInt(firstParam(queryParams, 'fpage'), 10) || 1);

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const groupsSearch = new URLSearchParams();
  if (status !== '') groupsSearch.set('status', status);
  groupsSearch.set('page', String(gpage));
  groupsSearch.set('limit', '10');
  const feedbackSearch = new URLSearchParams();
  if (fvalue !== '') feedbackSearch.set('value', fvalue);
  feedbackSearch.set('page', String(fpage));
  feedbackSearch.set('limit', '10');

  const [metricsResult, groupsResult, feedbackResult] = await Promise.all([
    backendFetch('/admin/advisor/metrics', { method: 'GET', cookieHeader }),
    backendFetch(`/admin/advisor/unanswered/groups?${groupsSearch.toString()}`, {
      method: 'GET',
      cookieHeader,
    }),
    backendFetch(`/admin/advisor/feedback?${feedbackSearch.toString()}`, {
      method: 'GET',
      cookieHeader,
    }),
  ]);

  const metrics =
    metricsResult.status === 200 && isMetrics(metricsResult.body) ? metricsResult.body : null;
  const groups =
    groupsResult.status === 200 && isGroupList(groupsResult.body) ? groupsResult.body : null;
  const feedback =
    feedbackResult.status === 200 && isFeedbackList(feedbackResult.body)
      ? feedbackResult.body
      : null;

  return (
    <AdminAdvisorView
      key={`${status}-${String(gpage)}-${fvalue}-${String(fpage)}`}
      metrics={metrics}
      metricsError={metrics === null}
      groups={groups}
      groupsError={groups === null}
      feedback={feedback}
      feedbackError={feedback === null}
      query={{ status, gpage, fvalue, fpage }}
      locale={locale}
      messages={messages}
    />
  );
}
