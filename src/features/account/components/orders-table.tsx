import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { Order } from '@/lib/api/orders';
import type { Dictionary } from '@/lib/i18n/index';
import { formatPrice } from '@/lib/money/format';
import { OrderStatusBadge } from './order-status-badge';

function formatDate(iso: string, locale: string): string {
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
}: {
  orders: Order[];
  locale: string;
  messages: Dictionary['account'];
  detailHrefFor: (id: string) => string;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[42rem] border-collapse bg-background text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
              {messages.tableOrder}
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
              {messages.tableDate}
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
              {messages.tableStatus}
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
              {messages.tableItems}
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
              {messages.tableTotal}
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
              <span className="sr-only">{messages.tableActions}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border last:border-0">
              <th scope="row" className="px-4 py-3 font-mono text-xs font-normal">
                {order.id.slice(0, 8)}…
              </th>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(order.createdAt, locale)}
              </td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} messages={messages} />
              </td>
              <td className="px-4 py-3">{order.itemCount}</td>
              <td className="px-4 py-3">
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
  return (
    <Stack gap="md">
      <Stack direction="horizontal" gap="md" align="center">
        <OrderStatusBadge status={order.status} messages={messages} />
        <Text variant="small" tone="muted">
          {formatDate(order.createdAt, locale)}
        </Text>
      </Stack>
      <Text variant="lead" as="div">
        {messages.itemsTitle}
      </Text>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[36rem] border-collapse bg-background text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                {messages.itemsTitle}
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                {messages.quantityHeader}
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                {messages.unitPriceHeader}
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                {messages.lineTotalHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId} className="border-b border-border last:border-0">
                <th scope="row" className="px-4 py-3 font-normal">
                  {item.name}
                </th>
                <td className="px-4 py-3">{item.qty}</td>
                <td className="px-4 py-3">
                  {formatPrice(item.unitPriceAmount, order.currency, locale)}
                </td>
                <td className="px-4 py-3">
                  {formatPrice(item.lineTotalAmount, order.currency, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Text variant="lead" as="div">
        {messages.shippingTitle}
      </Text>
      <Text variant="small" tone="muted">
        {order.shipping.fullName} · {order.shipping.line1} · {order.shipping.city} ·{' '}
        {order.shipping.country}
      </Text>
    </Stack>
  );
}
