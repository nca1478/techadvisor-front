import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { Order } from '@/lib/api/orders';
import { formatPrice } from '@/lib/money/format';

/**
 * Order summary rendered from the frozen server order (or the cart before
 * the order exists). Money always comes from the server response.
 */
export function OrderSummary({
  items,
  totalAmount,
  itemCount,
  currency,
  locale,
  title,
  itemsLabel,
  totalLabel,
}: {
  items: Array<{ name: string; qty: number; lineTotalAmount: number }>;
  totalAmount: number;
  itemCount: number;
  currency: string;
  locale: string;
  title: string;
  itemsLabel: string;
  totalLabel: string;
}) {
  return (
    <Stack gap="md">
      <Text
        variant="caption"
        as="span"
        tone="muted"
        className="font-mono uppercase tracking-[0.12em]"
      >
        {title}
      </Text>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={`${item.name}-${String(item.qty)}`}
            className="flex items-baseline justify-between gap-4"
          >
            <Text variant="small" tone="muted" className="min-w-0 truncate">
              {item.name} × {item.qty}
            </Text>
            <Text variant="small" as="span" className="price shrink-0">
              {formatPrice(item.lineTotalAmount, currency, locale)}
            </Text>
          </li>
        ))}
      </ul>
      <Stack direction="horizontal" justify="between" align="center">
        <Text variant="small" tone="muted">
          {itemsLabel.replace('{count}', String(itemCount))}
        </Text>
        <Text variant="small" as="span" className="price shrink-0">
          {formatPrice(totalAmount, currency, locale)}
        </Text>
      </Stack>
      <div className="border-t border-dashed border-border-strong" aria-hidden="true" />
      <Stack direction="horizontal" justify="between" align="baseline">
        <Text variant="body" as="span">
          {totalLabel}
        </Text>
        <Text variant="price-lg" as="span" role="status" className="text-primary">
          {formatPrice(totalAmount, currency, locale)}
        </Text>
      </Stack>
    </Stack>
  );
}

export function orderSummaryProps(order: Order): {
  items: Array<{ name: string; qty: number; lineTotalAmount: number }>;
  totalAmount: number;
  itemCount: number;
  currency: string;
} {
  return {
    items: order.items.map((item) => ({
      name: item.name,
      qty: item.qty,
      lineTotalAmount: item.lineTotalAmount,
    })),
    totalAmount: order.totalAmount,
    itemCount: order.itemCount,
    currency: order.currency,
  };
}
