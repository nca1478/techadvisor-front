'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
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
  // The admin order embeds the buyer's name/email (backend `AdminOrderDto`).
  // Narrow with typeof so a stale API response without these fields still
  // renders the userId instead of crashing or printing "undefined".
  const customerName =
    typeof order.userName === 'string' && order.userName.length > 0 ? order.userName : null;
  const customerEmail =
    typeof order.userEmail === 'string' && order.userEmail.length > 0 ? order.userEmail : null;
  // The admin order embeds the shipping snapshot (backend `AdminOrderDto`).
  // Read through `unknown` so a stale API response without `shipping` hides
  // the section instead of crashing or printing "undefined".
  function addressText(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
  }
  const rawShipping: unknown = (order as { shipping?: unknown }).shipping;
  const shipping =
    typeof rawShipping === 'object' && rawShipping !== null
      ? (rawShipping as AdminOrder['shipping'])
      : null;
  const shippingFullName = shipping === null ? null : addressText(shipping.fullName);
  const shippingStreet =
    shipping === null
      ? null
      : [addressText(shipping.line1), addressText(shipping.line2)]
          .filter((part) => part !== null)
          .join(', ');
  const localityParts: string[] = [];
  if (shipping !== null) {
    for (const part of [
      addressText(shipping.city),
      addressText(shipping.region),
      addressText(shipping.postalCode),
      addressText(shipping.country),
    ]) {
      if (part !== null) localityParts.push(part);
    }
  }
  const locality = localityParts.length > 0 ? localityParts.join(' · ') : null;
  const shippingPhone = shipping === null ? null : addressText(shipping.phone);
  const hasShipping =
    shippingFullName !== null ||
    (shippingStreet !== null && shippingStreet.length > 0) ||
    locality !== null ||
    shippingPhone !== null;

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
      <Stack direction="horizontal" gap="md" align="center" justify="between" wrap>
        <Heading level={2}>{orders.detailTitle.replace('{id}', order.id.slice(0, 8))}</Heading>
        <Stack direction="horizontal" gap="md" align="center">
          <OrderStatusBadge status={order.status} messages={messages.account} />
          <Text variant="small" tone="muted">
            {formatDate(order.createdAt, locale)}
          </Text>
        </Stack>
      </Stack>
      <Text variant="lead" as="div">
        {orders.tableCustomer}
      </Text>
      <Card>
        <Stack gap="sm">
          {customerName !== null || customerEmail !== null ? (
            <>
              {customerName !== null ? (
                <div>
                  <Text variant="caption" tone="muted">
                    {orders.customerName}
                  </Text>
                  <Text variant="small" as="p" className="font-medium">
                    {customerName}
                  </Text>
                </div>
              ) : null}
              {customerEmail !== null ? (
                <div>
                  <Text variant="caption" tone="muted">
                    {orders.customerEmail}
                  </Text>
                  <Text variant="small" as="p">
                    {customerEmail}
                  </Text>
                </div>
              ) : null}
            </>
          ) : (
            <Text variant="small" as="p" className="font-mono">
              {order.userId}
            </Text>
          )}
        </Stack>
      </Card>
      <Text variant="lead" as="div">
        {messages.account.itemsTitle}
      </Text>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[36rem] border-collapse bg-surface text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-4 py-3 text-xs font-bold text-foreground">
                {messages.account.itemsTitle}
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-foreground">
                {messages.account.quantityHeader}
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-foreground">
                {messages.account.unitPriceHeader}
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-foreground">
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
          <tfoot>
            <tr className="border-t border-border">
              <th
                scope="row"
                colSpan={3}
                className="px-4 py-3 text-right text-xs font-bold text-foreground"
              >
                {orders.tableTotal}
              </th>
              <td className="px-4 py-3 text-right font-bold tabular-nums">
                {formatPrice(order.totalAmount, order.currency, locale)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {hasShipping ? (
        <>
          <Text variant="lead" as="div">
            {orders.shippingTitle}
          </Text>
          <Card>
            <div className="grid grid-cols-[max-content_1fr] items-baseline gap-x-4 gap-y-3">
              {shippingFullName !== null ? (
                <>
                  <Text variant="small" tone="muted" className="font-bold">
                    {orders.shippingFullName}:
                  </Text>
                  <Text variant="small" as="p" className="font-medium">
                    {shippingFullName}
                  </Text>
                </>
              ) : null}
              {shippingStreet !== null && shippingStreet.length > 0 ? (
                <>
                  <Text variant="small" tone="muted" className="font-bold">
                    {orders.shippingAddress}:
                  </Text>
                  <Text variant="small" tone="muted" as="p">
                    {shippingStreet}
                  </Text>
                </>
              ) : null}
              {locality !== null ? (
                <>
                  <span aria-hidden="true" />
                  <Text variant="small" tone="muted" as="p">
                    {locality}
                  </Text>
                </>
              ) : null}
              {shippingPhone !== null ? (
                <>
                  <Text variant="small" tone="muted" className="font-bold">
                    {orders.shippingPhone}:
                  </Text>
                  <Text variant="small" tone="muted" as="p">
                    {shippingPhone}
                  </Text>
                </>
              ) : null}
            </div>
          </Card>
        </>
      ) : null}
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
