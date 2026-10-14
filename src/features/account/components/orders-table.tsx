import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { Order } from '@/lib/api/orders';
import type { Dictionary } from '@/lib/i18n/index';
import { formatPrice } from '@/lib/money/format';
import { OrderStatusBadge } from './order-status-badge';

/** Shared order-date formatting (list uses relative context; detail reuses it in the header). */
export function formatOrderDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

/**
 * Presentational orders table. Pure render over `orders` (already sorted
 * newest-first by the API); pagination state lives in the container.
 */
export function OrdersTable({
  orders,
  locale,
  messages,
  detailHrefFor,
  rowOffset = 0,
}: {
  orders: Order[];
  locale: string;
  messages: Dictionary['account'];
  detailHrefFor: (id: string) => string;
  /** Number of rows on previous pages (keeps the No column continuous). */
  rowOffset?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[42rem] border-collapse bg-surface text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="px-4 py-3 text-xs font-bold text-foreground">
              {messages.tableNumber}
            </th>
            <th scope="col" className="px-4 py-3 text-xs font-bold text-foreground">
              {messages.tableOrder}
            </th>
            <th scope="col" className="px-4 py-3 text-xs font-bold text-foreground">
              {messages.tableDate}
            </th>
            <th scope="col" className="px-4 py-3 text-xs font-bold text-foreground">
              {messages.tableStatus}
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-foreground">
              {messages.tableItems}
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-foreground">
              {messages.tableTotal}
            </th>
            <th scope="col" className="px-4 py-3 text-xs font-bold text-foreground">
              <span className="sr-only">{messages.tableActions}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 tabular-nums text-muted-foreground">
                {rowOffset + index + 1}
              </td>
              <th scope="row" className="px-4 py-3 font-mono text-xs font-normal">
                <Link href={detailHrefFor(order.id)} className="font-mono text-xs">
                  {order.id.slice(0, 8)}…
                </Link>
              </th>
              <td className="px-4 py-3 text-muted-foreground">
                {formatOrderDate(order.createdAt, locale)}
              </td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} messages={messages} />
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{order.itemCount}</td>
              <td className="px-4 py-3 text-right font-bold tabular-nums">
                {formatPrice(order.totalAmount, order.currency, locale)}
              </td>
              <td className="px-4 py-3">
                <Link href={detailHrefFor(order.id)}>{messages.viewOrder}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Presentational order detail: status, items and shipping address. */
export function OrderDetail({
  order,
  locale,
  messages,
}: {
  order: Order;
  locale: string;
  messages: Dictionary['account'];
}) {
  const shipping = order.shipping;
  const street = [shipping.line1, shipping.line2]
    .filter((part) => part !== undefined && part.length > 0)
    .join(', ');
  const locality = [shipping.city, shipping.region, shipping.postalCode, shipping.country]
    .filter((part) => part !== undefined && part.length > 0)
    .join(' · ');
  return (
    <Stack gap="md">
      <Text variant="lead" as="div">
        {messages.itemsTitle}
      </Text>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[36rem] border-collapse bg-surface text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-4 py-3 text-xs font-bold text-foreground">
                {messages.itemsTitle}
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-foreground">
                {messages.quantityHeader}
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-foreground">
                {messages.unitPriceHeader}
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-foreground">
                {messages.lineTotalHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId} className="border-b border-border last:border-0">
                <th scope="row" className="px-4 py-3 font-medium">
                  <Link href={`/${locale}/productos/${item.slug}`}>{item.name}</Link>
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
                {messages.tableTotal}
              </th>
              <td className="px-4 py-3 text-right font-bold tabular-nums">
                {formatPrice(order.totalAmount, order.currency, locale)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <Text variant="lead" as="div">
        {messages.shippingTitle}
      </Text>
      <Card>
        <div className="grid grid-cols-[max-content_1fr] items-baseline gap-x-4 gap-y-3">
          <Text variant="small" tone="muted" className="font-bold">
            {messages.shippingFullName}:
          </Text>
          <Text variant="small" as="p" className="font-medium">
            {shipping.fullName}
          </Text>
          <Text variant="small" tone="muted" className="font-bold">
            {messages.shippingAddress}:
          </Text>
          <Text variant="small" tone="muted" as="p">
            {street}
          </Text>
          {locality.length > 0 ? (
            <>
              <span aria-hidden="true" />
              <Text variant="small" tone="muted" as="p">
                {locality}
              </Text>
            </>
          ) : null}
          {shipping.phone !== undefined && shipping.phone.length > 0 ? (
            <>
              <Text variant="small" tone="muted" className="font-bold">
                {messages.shippingPhone}:
              </Text>
              <Text variant="small" tone="muted" as="p">
                {shipping.phone}
              </Text>
            </>
          ) : null}
        </div>
      </Card>
    </Stack>
  );
}
