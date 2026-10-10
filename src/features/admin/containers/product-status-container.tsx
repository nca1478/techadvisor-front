'use client';

import { useState, type ReactNode } from 'react';
import { badgeDots, badgeTones, type BadgeTone } from '@/components/ui/badge';
import { cn } from '@/components/ui/cn';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import {
  PRODUCT_STATUS_TONES,
  ProductStatusBadge,
} from '@/features/admin/components/product-status-badge';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import type { AdminProduct, AdminProductStatus } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

const STATUSES: AdminProductStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];

/**
 * Badge-styled action button: the exact `Badge` pill (shape, tint, dot)
 * with the tone of its target status — archivar in amber, pasar a borrador
 * in neutral, activar in green — plus a focus ring and pointer affordance
 * for interactivity.
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
        'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium leading-normal',
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
      <Stack direction="horizontal" gap="md" align="center" wrap>
        <ProductStatusBadge status={status} messages={productsMessages} />
        {STATUSES.filter((candidate) => candidate !== status).map((candidate) => (
          <StatusActionButton
            key={candidate}
            tone={PRODUCT_STATUS_TONES[candidate]}
            onClick={() => {
              setTarget(candidate);
            }}
          >
            {candidate === 'ACTIVE'
              ? productsMessages.activate
              : candidate === 'ARCHIVED'
                ? productsMessages.archive
                : productsMessages.moveToDraft}
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
