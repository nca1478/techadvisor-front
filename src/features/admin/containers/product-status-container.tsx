'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import { ProductStatusBadge } from '@/features/admin/components/product-status-badge';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import type { AdminProduct, AdminProductStatus } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

const STATUSES: AdminProductStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];

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
          <Button
            key={candidate}
            variant="secondary"
            size="sm"
            onClick={() => {
              setTarget(candidate);
            }}
          >
            {candidate === 'ACTIVE'
              ? productsMessages.activate
              : candidate === 'ARCHIVED'
                ? productsMessages.archive
                : productsMessages.moveToDraft}
          </Button>
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
