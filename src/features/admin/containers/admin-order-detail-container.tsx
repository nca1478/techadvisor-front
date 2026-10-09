'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { OrderStatusBadge } from '@/features/account/components/order-status-badge';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import type { AdminOrder } from '@/lib/api/admin';
import { adminNextStatuses } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';
import { formatPrice } from '@/lib/money/format';

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

/**
 * Order detail container: frozen items + status changer limited to the
 * admin-reachable transitions (`PAID` is webhook-only and never offered).
 * Every change asks for confirmation (transitions cannot be undone).
 */
export function AdminOrderDetailContainer({
  initialOrder,
  locale,
  messages,
}: {
  initialOrder: AdminOrder;
  locale: string;
  messages: Dictionary;
}) {
  const orders = messages.admin.orders;
  const [order, setOrder] = useState(initialOrder);
  const [target, setTarget] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const allowed = adminNextStatuses(order.status);
  const statusLabel = (status: string) =>
    (messages.account as Record<string, string>)[`status_${status}`] ?? status;

  async function handleConfirm() {
    if (target === '') return;
    setPending(true);
    setFeedback(null);
    try {
      const updated = await adminHttp.patch<AdminOrder>(
        `/orders/${encodeURIComponent(order.id)}/status`,
        { status: target },
      );
      setOrder(updated);
      setTarget('');
      setConfirmOpen(false);
      setFeedback({ ok: true, text: orders.statusUpdated });
    } catch (error) {
      setFeedback({ ok: false, text: adminErrorMessage(error, orders.statusUpdateError) });
      setConfirmOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Stack gap="md">
      <Stack direction="horizontal" gap="md" align="center" wrap>
        <OrderStatusBadge status={order.status} messages={messages.account} />
        <Text variant="small" tone="muted">
          {formatDate(order.createdAt, locale)}
        </Text>
        <Text variant="small" tone="muted">
          {orders.tableCustomer}: {order.userId.slice(0, 8)}…
        </Text>
        <Text variant="small" tone="muted">
          {orders.tableTotal}: {formatPrice(order.totalAmount, order.currency, locale)}
        </Text>
      </Stack>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[40rem] border-collapse bg-surface text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">
                {messages.account.itemsTitle}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium text-muted-foreground">
                {messages.account.quantityHeader}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium text-muted-foreground">
                {messages.account.unitPriceHeader}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium text-muted-foreground">
                {messages.account.lineTotalHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId} className="border-b border-border last:border-0">
                <th scope="row" className="px-4 py-3 font-medium">
                  {item.name}
                </th>
                <td className="px-4 py-3 text-right tabular-nums">{item.qty}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatPrice(item.unitPriceAmount, order.currency, locale)}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums">
                  {formatPrice(item.lineTotalAmount, order.currency, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Stack gap="sm">
        <Text variant="lead" as="div">
          {orders.changeStatus}
        </Text>
        {allowed.length === 0 ? (
          <Text variant="small" tone="muted">
            {orders.noTransitions}
          </Text>
        ) : (
          <Stack direction="horizontal" gap="md" align="end" wrap>
            <div className="min-w-52">
              <Select
                label={orders.newStatus}
                name="newStatus"
                value={target}
                options={allowed.map((status) => ({ value: status, label: statusLabel(status) }))}
                placeholder="—"
                onChange={(event) => {
                  setTarget(event.target.value);
                }}
              />
            </div>
            <Button
              variant="secondary"
              disabled={target === ''}
              onClick={() => {
                setConfirmOpen(true);
              }}
            >
              {orders.applyStatus}
            </Button>
          </Stack>
        )}
        {feedback ? (
          <Text
            role={feedback.ok ? 'status' : 'alert'}
            className={feedback.ok ? undefined : 'text-destructive'}
          >
            {feedback.text}
          </Text>
        ) : null}
      </Stack>
      <ConfirmDialog
        open={confirmOpen}
        title={messages.admin.confirmTitle}
        body={orders.statusConfirm
          .replace('{from}', statusLabel(order.status))
          .replace('{to}', statusLabel(target))}
        pending={pending}
        confirmLabel={pending ? orders.applyingStatus : orders.applyStatus}
        messages={messages.admin}
        onConfirm={() => void handleConfirm()}
        onClose={() => {
          if (!pending) setConfirmOpen(false);
        }}
      />
    </Stack>
  );
}
