'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { AdminFiltersCard, AdminHeaderCard } from '@/features/admin/components/admin-section';
import { Pagination } from '@/features/catalog/components/pagination';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import type {
  AdminAdvisorFeedback,
  AdminAdvisorFeedbackDetail,
  AdminAdvisorFeedbackList,
  AdminAdvisorMetrics,
  AdminAdvisorSession,
  AdminFeedbackValue,
  AdminUnansweredGroup,
  AdminUnansweredGroupList,
  AdminUnansweredStatus,
} from '@/lib/api/admin';
import { ADMIN_UNANSWERED_STATUSES, asOptionalId } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

export interface AdminAdvisorQuery {
  status: AdminUnansweredStatus | '';
  gpage: number;
  fvalue: AdminFeedbackValue | '';
  fpage: number;
}

interface FeedbackDetailState {
  loading: boolean;
  data: AdminAdvisorFeedbackDetail | null;
  error: string | null;
}

interface SessionState {
  loading: boolean;
  data: AdminAdvisorSession | null;
  error: string | null;
}

function formatPage(template: string, page: number, totalPages: number): string {
  return template.replace('{page}', String(page)).replace('{totalPages}', String(totalPages));
}

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function formatRate(rate: number | null, locale: string, fallback: string): string {
  if (rate === null) return fallback;
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(rate);
}

/**
 * Advisor improvement-loop container: metrics summary, frequency buckets of
 * abstentions with forward-only triage actions and a "create document"
 * shortcut, plus minimized feedback review with conversation links.
 * Filters and pagination are URL-driven (server re-fetches); mutations go
 * through the admin BFF and refresh the server state.
 */
export function AdminAdvisorView({
  metrics,
  metricsError,
  groups,
  groupsError,
  feedback,
  feedbackError,
  query,
  locale,
  messages,
}: {
  metrics: AdminAdvisorMetrics | null;
  metricsError: boolean;
  groups: AdminUnansweredGroupList | null;
  groupsError: boolean;
  feedback: AdminAdvisorFeedbackList | null;
  feedbackError: boolean;
  query: AdminAdvisorQuery;
  locale: string;
  messages: Dictionary;
}) {
  const router = useRouter();
  const advisor = messages.admin.advisor;
  const [pendingGroup, setPendingGroup] = useState<string | null>(null);
  const [groupNotice, setGroupNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [openFeedbackId, setOpenFeedbackId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, FeedbackDetailState | undefined>>({});
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);

  function navigate(next: Partial<AdminAdvisorQuery>) {
    const merged: AdminAdvisorQuery = { ...query, ...next };
    const search = new URLSearchParams();
    if (merged.status !== '') search.set('status', merged.status);
    if (merged.gpage > 1) search.set('gpage', String(merged.gpage));
    if (merged.fvalue !== '') search.set('fvalue', merged.fvalue);
    if (merged.fpage > 1) search.set('fpage', String(merged.fpage));
    const rendered = search.toString();
    router.push(`/${locale}/admin/asesor${rendered === '' ? '' : `?${rendered}`}`);
  }

  async function updateGroup(group: AdminUnansweredGroup, status: AdminUnansweredStatus) {
    if (pendingGroup !== null) return;
    setPendingGroup(group.key);
    setGroupNotice(null);
    try {
      for (const id of group.ids) {
        // Sequential triage moves; the backend rejects backward moves, so a
        // mixed-status bucket surfaces its first conflict as an error below.
        await adminHttp.patch(`/advisor/unanswered/${id}`, { status });
      }
      setGroupNotice({ ok: true, text: advisor.updated });
      router.refresh();
    } catch (error) {
      setGroupNotice({ ok: false, text: adminErrorMessage(error, advisor.updateError) });
    } finally {
      setPendingGroup(null);
    }
  }

  async function toggleFeedbackDetail(row: AdminAdvisorFeedback) {
    if (openFeedbackId === row.id) {
      setOpenFeedbackId(null);
      return;
    }
    setOpenFeedbackId(row.id);
    setOpenSessionId(null);
    const cached = details[row.id];
    if (cached?.data) return;
    setDetails((prev) => ({ ...prev, [row.id]: { loading: true, data: null, error: null } }));
    try {
      const data = await adminHttp.get<AdminAdvisorFeedbackDetail>(`/advisor/feedback/${row.id}`);
      setDetails((prev) => ({ ...prev, [row.id]: { loading: false, data, error: null } }));
    } catch (error) {
      setDetails((prev) => ({
        ...prev,
        [row.id]: {
          loading: false,
          data: null,
          error: adminErrorMessage(error, messages.admin.loadError),
        },
      }));
    }
  }

  async function openConversation(sessionId: string) {
    setOpenSessionId(sessionId);
    setSession({ loading: true, data: null, error: null });
    try {
      const data = await adminHttp.get<AdminAdvisorSession>(`/advisor/sessions/${sessionId}`);
      setSession({ loading: false, data, error: null });
    } catch (error) {
      setSession({
        loading: false,
        data: null,
        error: adminErrorMessage(error, advisor.conversationError),
      });
    }
  }

  function documentHref(sample: string): string {
    return `/${locale}/admin/documentos/nuevo?title=${encodeURIComponent(sample.slice(0, 120))}`;
  }

  const showTriage = query.status !== 'RESOLVED';
  const metricsText =
    metrics === null
      ? null
      : advisor.feedbackTotal
          .replace('{up}', String(metrics.feedbackUp))
          .replace('{down}', String(metrics.feedbackDown))
          .replace('{total}', String(metrics.feedbackTotal));
  const statusLabels: Record<string, string> = {
    NEW: advisor.status_NEW,
    IN_REVIEW: advisor.status_IN_REVIEW,
    RESOLVED: advisor.status_RESOLVED,
  };
  const reasonLabels: Record<string, string> = {
    no_evidence: advisor.reason_no_evidence,
    below_threshold: advisor.reason_below_threshold,
    no_candidates: advisor.reason_no_candidates,
    unknown_category: advisor.reason_unknown_category,
  };
  const statusHint =
    metrics === null
      ? null
      : metrics.unansweredByStatus
          .map((entry) => `${statusLabels[entry.key] ?? entry.key}: ${String(entry.count)}`)
          .join(' · ') || null;
  const satisfactionHint =
    metrics === null || metricsText === null
      ? null
      : metrics.feedbackTotal === 0
        ? advisor.satisfactionNoVotes
        : metricsText;
  const viewAll = messages.admin.dashboard.viewAll;

  return (
    <Stack gap="md">
      <AdminHeaderCard title={advisor.title} subtitle={advisor.subtitle} />

      {metricsError || metrics === null ? (
        <Text role="alert" className="text-destructive">
          {messages.admin.loadError}
        </Text>
      ) : (
        <Stack gap="md">
          <div className="flex flex-col gap-3 lg:flex-row">
            <Card className="lg:flex-1" tone={metrics.openUnanswered > 0 ? 'warning' : 'success'}>
              <Stack gap="sm">
                <Text variant="caption" tone="muted" as="div">
                  {advisor.openUnanswered}
                </Text>
                <Text variant="price" as="div">
                  {metrics.openUnanswered}
                </Text>
                {statusHint !== null && (
                  <Text variant="caption" tone="muted" as="div">
                    {statusHint}
                  </Text>
                )}
                <Link href="#advisor-groups">{viewAll}</Link>
              </Stack>
            </Card>
            <Card className="lg:flex-1" tone="primary">
              <Stack gap="sm">
                <Text variant="caption" tone="muted" as="div">
                  {advisor.satisfaction}
                </Text>
                <Text variant="price" as="div">
                  {formatRate(metrics.satisfactionRate, locale, '—')}
                </Text>
                {satisfactionHint !== null && (
                  <Text variant="caption" tone="muted" as="div">
                    {satisfactionHint}
                  </Text>
                )}
                <Link href="#advisor-feedback">{viewAll}</Link>
              </Stack>
            </Card>
            {metrics.unansweredByReason.map((entry) => (
              <Card key={entry.key} className="lg:flex-1" tone="warning">
                <Stack gap="sm">
                  <Text variant="caption" tone="muted" as="div">
                    {reasonLabels[entry.key] ?? entry.key}
                  </Text>
                  <Text variant="price" as="div">
                    {entry.count}
                  </Text>
                  <Link href="#advisor-groups">{viewAll}</Link>
                </Stack>
              </Card>
            ))}
          </div>
        </Stack>
      )}
      <div id="advisor-groups">
        <AdminHeaderCard title={advisor.groupsTitle} subtitle={advisor.createDocumentHint} />
      </div>
      <AdminFiltersCard>
        <div className="min-w-44">
          <Select
            label={advisor.statusFilter}
            name="status"
            value={query.status}
            options={[
              { value: '', label: advisor.allStatuses },
              ...ADMIN_UNANSWERED_STATUSES.map((status) => ({
                value: status,
                label: advisor[`status_${status}` as const],
              })),
            ]}
            onChange={(event) => {
              navigate({ status: event.target.value as AdminAdvisorQuery['status'], gpage: 1 });
            }}
          />
        </div>
      </AdminFiltersCard>
      {groupNotice !== null && (
        <Text
          role={groupNotice.ok ? 'status' : 'alert'}
          className={groupNotice.ok ? undefined : 'text-destructive'}
        >
          {groupNotice.text}
        </Text>
      )}
      {groupsError || groups === null ? (
        <Text role="alert" className="text-destructive">
          {messages.admin.loadError}
        </Text>
      ) : groups.data.length === 0 ? (
        <Text tone="muted">{advisor.emptyGroups}</Text>
      ) : (
        <Stack gap="md">
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] border-collapse bg-surface text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {advisor.tableQuestion}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {advisor.tableTimes}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {advisor.tableLatest}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {advisor.tableActions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groups.data.map((group) => (
                    <tr key={group.key} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">{group.sample}</td>
                      <td className="px-4 py-3">{group.count}</td>
                      <td className="px-4 py-3">{formatDate(group.latestAt, locale)}</td>
                      <td className="px-4 py-3">
                        <Stack direction="horizontal" gap="sm" wrap>
                          {showTriage && query.status !== 'IN_REVIEW' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={pendingGroup !== null}
                              onClick={() => {
                                void updateGroup(group, 'IN_REVIEW');
                              }}
                            >
                              {pendingGroup === group.key ? advisor.resolving : advisor.markReview}
                            </Button>
                          )}
                          {showTriage && (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={pendingGroup !== null}
                              onClick={() => {
                                void updateGroup(group, 'RESOLVED');
                              }}
                            >
                              {pendingGroup === group.key
                                ? advisor.resolving
                                : advisor.markResolved}
                            </Button>
                          )}
                          <Button variant="link" size="sm" href={documentHref(group.sample)}>
                            {advisor.createDocument}
                          </Button>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination
            page={groups.page}
            totalPages={groups.totalPages}
            onPageChange={(page) => {
              navigate({ gpage: page });
            }}
            previousLabel={messages.admin.previous}
            nextLabel={messages.admin.next}
            statusLabel={(page, totalPages) => formatPage(messages.admin.pageOf, page, totalPages)}
          />
        </Stack>
      )}

      <div id="advisor-feedback">
        <AdminHeaderCard title={advisor.feedbackTitle} subtitle={advisor.conversationNote} />
      </div>
      <AdminFiltersCard>
        <div className="min-w-44">
          <Select
            label={advisor.valueFilter}
            name="fvalue"
            value={query.fvalue}
            options={[
              { value: '', label: advisor.allValues },
              { value: 'up', label: advisor.value_up },
              { value: 'down', label: advisor.value_down },
            ]}
            onChange={(event) => {
              navigate({ fvalue: event.target.value as AdminAdvisorQuery['fvalue'], fpage: 1 });
            }}
          />
        </div>
      </AdminFiltersCard>
      {feedbackError || feedback === null ? (
        <Text role="alert" className="text-destructive">
          {messages.admin.loadError}
        </Text>
      ) : feedback.data.length === 0 ? (
        <Text tone="muted">{messages.common.emptyTitle}</Text>
      ) : (
        <Stack gap="md">
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] border-collapse bg-surface text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-sm font-bold text-muted-foreground"
                    >
                      {advisor.tableVote}
                    </th>
                    <th
                      scope="col"
                      className="w-full px-4 py-3 text-sm font-bold text-muted-foreground"
                    >
                      {advisor.tableExcerpt}
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-sm font-bold text-muted-foreground"
                    >
                      {advisor.tableDate}
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-sm font-bold text-muted-foreground"
                    >
                      {advisor.tableActions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.data.map((row) => {
                    const sessionId = asOptionalId(row.sessionId);
                    const detail = details[row.id];
                    const expanded = openFeedbackId === row.id;
                    return (
                      <tr key={row.id} className="border-b border-border last:border-0">
                        <td className="whitespace-nowrap px-4 py-3 align-top">
                          <Badge
                            tone={row.value === 'up' ? 'success' : 'destructive'}
                            className="whitespace-nowrap"
                          >
                            {row.value === 'up' ? advisor.value_up : advisor.value_down}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Stack gap="sm">
                            {!expanded && <Text>{row.queryExcerpt}</Text>}
                            {expanded && (
                              <Stack gap="sm">
                                {detail === undefined || detail.loading ? (
                                  <Text tone="muted">{messages.common.loading}</Text>
                                ) : detail.error !== null ? (
                                  <Text role="alert" className="text-destructive">
                                    {detail.error}
                                  </Text>
                                ) : (
                                  detail.data !== null && (
                                    <Stack gap="sm">
                                      <Text>
                                        <strong>{advisor.detailQueryLabel}:</strong>{' '}
                                        {detail.data.query}
                                      </Text>
                                      <Text>
                                        <strong>{advisor.detailAnswerLabel}:</strong>{' '}
                                        {detail.data.answer}
                                      </Text>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        href={documentHref(detail.data.query)}
                                      >
                                        {advisor.createDocument}
                                      </Button>
                                    </Stack>
                                  )
                                )}
                              </Stack>
                            )}
                          </Stack>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 align-top">
                          {formatDate(row.createdAt, locale)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 align-top">
                          <Stack direction="horizontal" gap="sm">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                void toggleFeedbackDetail(row);
                              }}
                            >
                              {advisor.viewDetail}
                            </Button>
                            {sessionId !== null && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  void openConversation(sessionId);
                                }}
                              >
                                {advisor.viewConversation}
                              </Button>
                            )}
                          </Stack>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination
            page={feedback.page}
            totalPages={feedback.totalPages}
            onPageChange={(page) => {
              navigate({ fpage: page });
            }}
            previousLabel={messages.admin.previous}
            nextLabel={messages.admin.next}
            statusLabel={(page, totalPages) => formatPage(messages.admin.pageOf, page, totalPages)}
          />
        </Stack>
      )}

      {openSessionId !== null && (
        <Card>
          <Stack gap="sm">
            <Heading level={3}>{advisor.conversationTitle}</Heading>
            <Text tone="muted">{advisor.conversationNote}</Text>
            {session === null || session.loading ? (
              <Text tone="muted">{messages.common.loading}</Text>
            ) : session.error !== null ? (
              <Text role="alert" className="text-destructive">
                {session.error}
              </Text>
            ) : session.data === null || session.data.messages.length === 0 ? (
              <Text tone="muted">{advisor.conversationEmpty}</Text>
            ) : (
              <Stack gap="sm">
                {session.data.messages.map((message, index) => (
                  <Text key={`${message.createdAt}-${String(index)}`}>
                    <strong>{message.role}:</strong> {message.excerpt}
                  </Text>
                ))}
              </Stack>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setOpenSessionId(null);
                setSession(null);
              }}
            >
              {advisor.close}
            </Button>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
