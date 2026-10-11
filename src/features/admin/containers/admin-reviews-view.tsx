'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { AdminFiltersCard, AdminHeaderCard } from '@/features/admin/components/admin-section';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import { Pagination } from '@/features/catalog/components/pagination';
import { ReviewStars } from '@/features/reviews/components/review-stars';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import type { AdminReview, AdminReviewList, AdminReviewStatus } from '@/lib/api/admin';
import { ADMIN_REVIEW_STATUSES } from '@/lib/api/admin';
import { formatReviewDate } from '@/features/reviews/components/review-list';
import type { Dictionary } from '@/lib/i18n/index';

export interface AdminReviewsQuery {
  status: AdminReviewStatus | '';
  page: number;
}

type ModerateTarget = 'PUBLISHED' | 'REJECTED';

const STATUS_TONES: Record<AdminReviewStatus, BadgeTone> = {
  PENDING: 'warning',
  PUBLISHED: 'success',
  REJECTED: 'destructive',
};

function formatPage(template: string, page: number, totalPages: number): string {
  return template.replace('{page}', String(page)).replace('{totalPages}', String(totalPages));
}

/** Short product reference (full UUID stays behind the detail lookup). */
function shortId(id: string): string {
  return id.length <= 8 ? id : `${id.slice(0, 8)}…`;
}

/**
 * Reviews moderation container: URL-driven status filter + pagination
 * (server re-fetches on navigation). Publish/reject go through the admin
 * BFF with a confirmation dialog; the backend enforces the allowed
 * transitions (PENDING → PUBLISHED|REJECTED, PUBLISHED → REJECTED,
 * REJECTED → PUBLISHED).
 */
export function AdminReviewsView({
  data,
  loadError,
  query,
  locale,
  messages,
}: {
  data: AdminReviewList | null;
  loadError: boolean;
  query: AdminReviewsQuery;
  locale: string;
  messages: Dictionary;
}) {
  const router = useRouter();
  const moderation = messages.admin.reviews;
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ review: AdminReview; target: ModerateTarget } | null>(
    null,
  );
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  function navigate(next: Partial<AdminReviewsQuery>) {
    const merged: AdminReviewsQuery = { ...query, ...next };
    const search = new URLSearchParams();
    if (merged.status !== '') search.set('status', merged.status);
    if (merged.page > 1) search.set('page', String(merged.page));
    const rendered = search.toString();
    router.push(`/${locale}/admin/resenas${rendered === '' ? '' : `?${rendered}`}`);
  }

  async function moderate(review: AdminReview, target: ModerateTarget) {
    if (pendingId !== null) return;
    setPendingId(review.id);
    setNotice(null);
    try {
      await adminHttp.patch(`/reviews/${review.id}/status`, { status: target });
      setNotice({ ok: true, text: moderation.moderated });
      setConfirm(null);
      router.refresh();
    } catch (error) {
      setNotice({ ok: false, text: adminErrorMessage(error, moderation.moderateError) });
    } finally {
      setPendingId(null);
    }
  }

  const totalPages = data === null ? 1 : Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <Stack gap="md">
      <AdminHeaderCard title={moderation.title} subtitle={moderation.subtitle} />
      <AdminFiltersCard>
        <div className="min-w-44">
          <Select
            label={moderation.statusFilter}
            name="status"
            value={query.status}
            options={[
              { value: '', label: moderation.allStatuses },
              ...ADMIN_REVIEW_STATUSES.map((status) => ({
                value: status,
                label: moderation[`status_${status}` as const],
              })),
            ]}
            onChange={(event) => {
              navigate({ status: event.target.value as AdminReviewsQuery['status'], page: 1 });
            }}
          />
        </div>
      </AdminFiltersCard>
      {notice !== null && (
        <Text
          role={notice.ok ? 'status' : 'alert'}
          className={notice.ok ? undefined : 'text-destructive'}
        >
          {notice.text}
        </Text>
      )}
      {loadError || data === null ? (
        <Text role="alert" className="text-destructive">
          {messages.admin.loadError}
        </Text>
      ) : data.data.length === 0 ? (
        <Text tone="muted">{moderation.empty}</Text>
      ) : (
        <Stack gap="md">
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] border-collapse bg-surface text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {moderation.tableDate}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {moderation.tableProduct}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {moderation.tableRating}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {moderation.tableReview}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {moderation.tableStatus}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {moderation.tableActions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((review) => (
                    <tr key={review.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">{formatReviewDate(review.createdAt, locale)}</td>
                      <td className="px-4 py-3">
                        <Text variant="small">{shortId(review.productId)}</Text>
                      </td>
                      <td className="px-4 py-3">
                        <ReviewStars
                          rating={review.rating}
                          label={messages.reviews.starsLabel.replace(
                            '{rating}',
                            String(review.rating),
                          )}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Stack gap="sm">
                          <Text as="span" variant="small" className="font-semibold">
                            {review.title}
                          </Text>
                          <Text variant="small" tone="muted">
                            {review.body}
                          </Text>
                        </Stack>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_TONES[review.status]}>
                          {moderation[`status_${review.status}` as const]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Stack direction="horizontal" gap="sm" wrap>
                          {review.status !== 'PUBLISHED' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={pendingId !== null}
                              onClick={() => {
                                setConfirm({ review, target: 'PUBLISHED' });
                              }}
                            >
                              {pendingId === review.id ? moderation.moderating : moderation.publish}
                            </Button>
                          )}
                          {review.status !== 'REJECTED' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={pendingId !== null}
                              onClick={() => {
                                setConfirm({ review, target: 'REJECTED' });
                              }}
                            >
                              {pendingId === review.id ? moderation.moderating : moderation.reject}
                            </Button>
                          )}
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination
            page={data.page}
            totalPages={totalPages}
            onPageChange={(page) => {
              navigate({ page });
            }}
            previousLabel={messages.admin.previous}
            nextLabel={messages.admin.next}
            statusLabel={(page, total) => formatPage(messages.admin.pageOf, page, total)}
          />
        </Stack>
      )}
      <ConfirmDialog
        open={confirm !== null}
        title={messages.admin.confirmTitle}
        body={
          confirm?.target === 'PUBLISHED' ? moderation.publishConfirm : moderation.rejectConfirm
        }
        confirmLabel={confirm?.target === 'PUBLISHED' ? moderation.publish : moderation.reject}
        pending={pendingId !== null}
        onConfirm={() => {
          if (confirm !== null) void moderate(confirm.review, confirm.target);
        }}
        onClose={() => {
          if (pendingId === null) setConfirm(null);
        }}
        messages={messages.admin}
      />
    </Stack>
  );
}
