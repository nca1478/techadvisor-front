'use client';

import { useState, type ReactNode } from 'react';
import { badgeDots, badgeTones, type BadgeTone } from '@/components/ui/badge';
import { cn } from '@/components/ui/cn';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import { ProductStatusBadge } from '@/features/admin/components/product-status-badge';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import type { AdminProduct, AdminProductStatus } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

const STATUSES: AdminProductStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];

/**
 * Button tones per target status: same language as the status badges,
 * except "move to draft", which uses the brand tint (primary) instead of
 * neutral gray so it stands out from the inactive background.
 */
const ACTION_TONES: Record<AdminProductStatus, BadgeTone> = {
  DRAFT: 'primary',
  ACTIVE: 'success',
  ARCHIVED: 'warning',
};

/**
 * Badge-styled action button: the `Badge` shape, tint and dot (see
 * `badgeTones` / `badgeDots`) with the tone of its target status, plus a
 * focus ring and pointer affordance for interactivity.
 */
function StatusActionButton({
  tone,
  onClick,
  children,
}: {
  tone: BadgeTone;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] leading-normal',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        badgeTones[tone],
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', badgeDots[tone])} />
      {children}
    </button>
  );
}

/**
 * Status changer: status moves through a dedicated endpoint
 * (`PATCH /admin/products/:id/status`) with confirmation for the visible,
 * catalog-affecting moves (activate/archive). The backend treats archival
 * as logical — nothing is ever deleted.
 */
export function ProductStatusContainer({
  productId,
  initialStatus,
  messages,
  onChanged,
}: {
  productId: string;
  initialStatus: AdminProductStatus;
  messages: Dictionary;
  onChanged?: (status: AdminProductStatus) => void;
}) {
  const productsMessages = messages.admin.products;
  const [status, setStatus] = useState(initialStatus);
  const [target, setTarget] = useState<AdminProductStatus | null>(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleConfirm() {
    if (!target) return;
    setPending(true);
    setFeedback(null);
    try {
      const updated = await adminHttp.patch<AdminProduct>(
        `/products/${encodeURIComponent(productId)}/status`,
        { status: target },
      );
      setStatus(updated.status);
      onChanged?.(updated.status);
      setTarget(null);
      setFeedback({ ok: true, text: productsMessages.statusChanged });
    } catch (error) {
      setFeedback({
        ok: false,
        text: adminErrorMessage(error, productsMessages.statusChangeError),
      });
      setTarget(null);
    } finally {
      setPending(false);
    }
  }

  const confirmBody =
    target === 'ARCHIVED'
      ? productsMessages.archiveConfirm
      : target === 'ACTIVE'
        ? productsMessages.activateConfirm
        : null;

  return (
    <Stack gap="sm">
      <Stack direction="horizontal" gap="md" align="center">
        <ProductStatusBadge status={status} messages={productsMessages} />
        {STATUSES.filter((candidate) => candidate !== status).map((candidate) => (
          <StatusActionButton
            key={candidate}
            tone={ACTION_TONES[candidate]}
            onClick={() => {
              setTarget(candidate);
            }}
          >
            {candidate === 'ACTIVE'
              ? productsMessages.activate
              : candidate === 'ARCHIVED'
                ? productsMessages.archive
                : productsMessages.status_DRAFT}
          </StatusActionButton>
        ))}
      </Stack>
      {feedback ? (
        <Text
          role={feedback.ok ? 'status' : 'alert'}
          className={feedback.ok ? undefined : 'text-destructive'}
        >
          {feedback.text}
        </Text>
      ) : null}
      <ConfirmDialog
        open={target !== null}
        title={messages.admin.confirmTitle}
        body={confirmBody ?? undefined}
        pending={pending}
        messages={messages.admin}
        onConfirm={() => void handleConfirm()}
        onClose={() => {
          if (!pending) setTarget(null);
        }}
      />
    </Stack>
  );
}
