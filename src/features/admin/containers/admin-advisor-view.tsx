'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Tabs } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { AdminFiltersCard, AdminHeaderCard } from '@/features/admin/components/admin-section';
import { ConversationDialog } from '@/features/admin/components/conversation-dialog';
import type { ConversationSessionState } from '@/features/admin/components/conversation-dialog';
import { Pagination } from '@/features/catalog/components/pagination';
import { adminErrorMessage, adminHttp, AdminHttpError } from '@/features/admin/lib/admin-http';
import type {
  AdminAdvisorFeedback,
  AdminAdvisorFeedbackDetail,
  AdminAdvisorFeedbackList,
  AdminAdvisorMetrics,
  AdminAdvisorSession,
  AdminFeedbackValue,
  AdminUnansweredGroup,
  AdminUnansweredGroupList,
  AdminUnansweredQuery,
  AdminUnansweredStatus,
} from '@/lib/api/admin';
import { ADMIN_UNANSWERED_STATUSES, asOptionalId } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

export interface AdminAdvisorQuery {
  status: AdminUnansweredStatus | '';
  gpage: number;
  fvalue: AdminFeedbackValue | '';
  fpage: number;
  tab: 'feedback' | 'groups';
}

interface FeedbackDetailState {
  loading: boolean;
  data: AdminAdvisorFeedbackDetail | null;
  error: string | null;
}

interface GroupDetailState {
  loading: boolean;
  data: AdminUnansweredQuery | null;
  error: string | null;
}

type SessionState = ConversationSessionState;

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
 * Distinct triage statuses carried by a frequency bucket (backend `statuses`,
 * see backend ADR 0060). Older cached payloads may omit it: `null` means
 * "unknown" and callers fall back to the URL-filter heuristic.
 */
function groupStatuses(group: AdminUnansweredGroup): string[] | null {
  const raw = (group as { statuses?: unknown }).statuses;
  if (!Array.isArray(raw)) return null;
  const known = raw.filter((status): status is string => typeof status === 'string');
  return known.length > 0 ? known : [];
}

/** "Revisar" only moves NEW → IN_REVIEW, so it needs at least one NEW row. */
function canMarkReview(group: AdminUnansweredGroup, filter: AdminAdvisorQuery['status']): boolean {
  const statuses = groupStatuses(group);
  if (statuses === null) return filter !== 'IN_REVIEW';
  return statuses.includes('NEW');
}

/** "Resolver" moves NEW/IN_REVIEW → RESOLVED; fully RESOLVED buckets hide it. */
function canMarkResolved(group: AdminUnansweredGroup): boolean {
  const statuses = groupStatuses(group);
  if (statuses === null) return true;
  return statuses.some((status) => status !== 'RESOLVED');
}

function isBackwardMoveError(error: unknown): boolean {
  return (
    error instanceof AdminHttpError &&
    error.status === 400 &&
    error.message.includes('triage only moves forward')
  );
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
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);
  const [groupDetails, setGroupDetails] = useState<Record<string, GroupDetailState | undefined>>(
    {},
  );
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const [activeTab, setActiveTab] = useState<AdminAdvisorQuery['tab']>(query.tab);

  useEffect(() => {
    setActiveTab(query.tab);
  }, [query.tab]);

  function navigate(next: Partial<AdminAdvisorQuery>) {
    const merged: AdminAdvisorQuery = { ...query, ...next };
    const search = new URLSearchParams();
    if (merged.tab === 'groups') search.set('tab', 'groups');
    if (merged.status !== '') search.set('status', merged.status);
    if (merged.gpage > 1) search.set('gpage', String(merged.gpage));
    if (merged.fvalue !== '') search.set('fvalue', merged.fvalue);
    if (merged.fpage > 1) search.set('fpage', String(merged.fpage));
    const rendered = search.toString();
    router.push(`/${locale}/admin/asesor${rendered === '' ? '' : `?${rendered}`}`, {
      scroll: false,
    });
  }

  function selectTab(tab: AdminAdvisorQuery['tab']) {
    setActiveTab(tab);
    if (tab !== query.tab) navigate({ tab });
  }

  async function updateGroup(group: AdminUnansweredGroup, status: AdminUnansweredStatus) {
    if (pendingGroup !== null) return;
    setPendingGroup(group.key);
    setGroupNotice(null);
    try {
      let skippedBackward = 0;
      for (const id of group.ids) {
        // Buckets mix statuses, so a group action can target rows that are
        // already past it (e.g. Revisar over a RESOLVED row): those 400s are
        // skipped, any other failure aborts with an error below.
        try {
          await adminHttp.patch(`/advisor/unanswered/${id}`, { status });
        } catch (error) {
          if (isBackwardMoveError(error)) {
            skippedBackward += 1;
            continue;
          }
          throw error;
        }
      }
      if (skippedBackward > 0 && skippedBackward === group.ids.length) {
        setGroupNotice({ ok: true, text: advisor.updated });
      } else {
        setGroupNotice({ ok: true, text: advisor.updated });
      }
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

  async function toggleGroupDetail(group: AdminUnansweredGroup) {
    if (openGroupKey === group.key) {
      setOpenGroupKey(null);
      return;
    }
    setOpenGroupKey(group.key);
    setOpenSessionId(null);
    const cached = groupDetails[group.key];
    if (cached?.data) return;
    if (group.ids.length === 0) {
      setGroupDetails((prev) => ({
        ...prev,
        [group.key]: { loading: false, data: null, error: messages.admin.loadError },
      }));
      return;
    }
    const newestId = group.ids[0];
    setGroupDetails((prev) => ({
      ...prev,
      [group.key]: { loading: true, data: null, error: null },
    }));
    try {
      const data = await adminHttp.get<AdminUnansweredQuery>(`/advisor/unanswered/${newestId}`);
      setGroupDetails((prev) => ({
        ...prev,
        [group.key]: { loading: false, data, error: null },
      }));
    } catch (error) {
      setGroupDetails((prev) => ({
        ...prev,
        [group.key]: {
          loading: false,
          data: null,
          error: adminErrorMessage(error, messages.admin.loadError),
        },
      }));
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

  const groupsPanel = (
    <Stack gap="md">
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
        <Stack gap="md">
          <Text tone="muted">{advisor.emptyGroups}</Text>
          <Pagination
            page={1}
            totalPages={1}
            onPageChange={() => {}}
            previousLabel={messages.admin.previous}
            nextLabel={messages.admin.next}
            statusLabel={(page, totalPages) => formatPage(messages.admin.pageOf, page, totalPages)}
            alwaysVisible
          />
        </Stack>
      ) : (
        <Stack gap="md">
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] border-collapse bg-surface text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-sm font-bold text-muted-foreground"
                    >
                      {advisor.tableNumber}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {advisor.tableQuestion}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {advisor.tableTimes}
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-sm font-bold text-muted-foreground"
                    >
                      {advisor.tableDate}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {advisor.tableActions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groups.data.map((group, index) => {
                    const reviewable = showTriage && canMarkReview(group, query.status);
                    const resolvable = showTriage && canMarkResolved(group);
                    const expanded = openGroupKey === group.key;
                    const groupDetail = groupDetails[group.key];
                    return (
                      <tr key={group.key} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-right align-top tabular-nums text-muted-foreground">
                          {(groups.page - 1) * groups.limit + index + 1}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Stack gap="sm">
                            {!expanded && <Text>{group.sample}</Text>}
                            {expanded && (
                              <Stack gap="sm">
                                {groupDetail === undefined || groupDetail.loading ? (
                                  <Text tone="muted">{messages.common.loading}</Text>
                                ) : groupDetail.error !== null ? (
                                  <Text role="alert" className="text-destructive">
                                    {groupDetail.error}
                                  </Text>
                                ) : (
                                  groupDetail.data !== null && (
                                    <Stack gap="sm">
                                      <Text>
                                        <strong>{advisor.detailQueryLabel}:</strong>{' '}
                                        {groupDetail.data.query}
                                      </Text>
                                      <Text>
                                        <strong>{advisor.detailReasonLabel}:</strong>{' '}
                                        {reasonLabels[groupDetail.data.reason] ??
                                          groupDetail.data.reason}
                                      </Text>
                                    </Stack>
                                  )
                                )}
                              </Stack>
                            )}
                          </Stack>
                        </td>
                        <td className="px-4 py-3 align-top tabular-nums">{group.count}</td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          {formatDate(group.latestAt, locale)}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Stack direction="horizontal" gap="sm" wrap>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                void toggleGroupDetail(group);
                              }}
                            >
                              {advisor.viewDetail}
                            </Button>
                            {reviewable && (
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={pendingGroup !== null}
                                onClick={() => {
                                  void updateGroup(group, 'IN_REVIEW');
                                }}
                              >
                                {pendingGroup === group.key
                                  ? advisor.resolving
                                  : advisor.markReview}
                              </Button>
                            )}
                            {resolvable && (
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
                            {!reviewable && !resolvable && (
                              <Text variant="caption" tone="muted">
                                {advisor.status_RESOLVED}
                              </Text>
                            )}
                            <Button variant="link" size="sm" href={documentHref(group.sample)}>
                              {advisor.createDocument}
                            </Button>
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
            page={groups.page}
            totalPages={groups.totalPages}
            onPageChange={(page) => {
              navigate({ gpage: page });
            }}
            previousLabel={messages.admin.previous}
            nextLabel={messages.admin.next}
            statusLabel={(page, totalPages) => formatPage(messages.admin.pageOf, page, totalPages)}
            alwaysVisible
          />
        </Stack>
      )}
    </Stack>
  );

  const feedbackPanel = (
    <Stack gap="md">
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
        <Stack gap="md">
          <Text tone="muted">{messages.common.emptyTitle}</Text>
          <Pagination
            page={1}
            totalPages={1}
            onPageChange={() => {}}
            previousLabel={messages.admin.previous}
            nextLabel={messages.admin.next}
            statusLabel={(page, totalPages) => formatPage(messages.admin.pageOf, page, totalPages)}
            alwaysVisible
          />
        </Stack>
      ) : (
        <Stack gap="md">
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] border-collapse bg-surface text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-sm font-bold text-muted-foreground"
                    >
                      {advisor.tableNumber}
                    </th>
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
                  {feedback.data.map((row, index) => {
                    const sessionId = asOptionalId(row.sessionId);
                    const detail = details[row.id];
                    const expanded = openFeedbackId === row.id;
                    return (
                      <tr key={row.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-right align-top tabular-nums text-muted-foreground">
                          {(feedback.page - 1) * feedback.limit + index + 1}
                        </td>
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
            alwaysVisible
          />
        </Stack>
      )}
    </Stack>
  );

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
                <Text variant="small" tone="muted" as="div" className="font-bold">
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
                <div className="text-left">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      selectTab('groups');
                    }}
                  >
                    {viewAll}
                  </Button>
                </div>
              </Stack>
            </Card>
            <Card className="lg:flex-1" tone="primary">
              <Stack gap="sm">
                <Text variant="small" tone="muted" as="div" className="font-bold">
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
                <div className="text-left">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      selectTab('feedback');
                    }}
                  >
                    {viewAll}
                  </Button>
                </div>
              </Stack>
            </Card>
            {metrics.unansweredByReason.map((entry) => (
              <Card key={entry.key} className="lg:flex-1" tone="warning">
                <Stack gap="sm">
                  <Text variant="small" tone="muted" as="div" className="font-bold">
                    {reasonLabels[entry.key] ?? entry.key}
                  </Text>
                  <Text variant="price" as="div">
                    {entry.count}
                  </Text>
                  <div className="text-left">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        selectTab('groups');
                      }}
                    >
                      {viewAll}
                    </Button>
                  </div>
                </Stack>
              </Card>
            ))}
          </div>
        </Stack>
      )}
      <Tabs
        label={advisor.title}
        selectedId={activeTab}
        onSelect={(id) => {
          if (id === 'feedback' || id === 'groups') selectTab(id);
        }}
        items={[
          { id: 'feedback', label: advisor.feedbackTitle, content: feedbackPanel },
          { id: 'groups', label: advisor.groupsTitle, content: groupsPanel },
        ]}
      />

      <ConversationDialog
        open={openSessionId !== null}
        session={session}
        onClose={() => {
          setOpenSessionId(null);
          setSession(null);
        }}
        messages={messages}
      />
    </Stack>
  );
}
