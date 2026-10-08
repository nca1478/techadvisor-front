import { Button } from '@/components/ui/button';
import { MediaFrame } from '@/components/ui/media-frame';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { CartItem } from '@/lib/api/cart';
import { formatPrice } from '@/lib/money/format';

export interface CartLineMessages {
  remove: string;
  increase: string;
  decrease: string;
  quantity: string;
  productLink: string;
  insufficientStock: string;
}

/** Presentational cart line: thumbnail, server-computed prices, qty stepper, remove. */
export function CartLine({
  item,
  currency,
  locale,
  pending,
  messages,
  onUpdateQty,
  onRemove,
}: {
  item: CartItem;
  currency: string;
  locale: string;
  pending: boolean;
  messages: CartLineMessages;
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
}) {
  const imageSrc = typeof item.imageUrl === 'string' ? item.imageUrl : null;
  return (
    <li className="flex flex-col gap-3 rounded-md border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 gap-3">
        <a
          href={`/${locale}/productos/${item.slug}`}
          aria-label={messages.productLink}
          className="w-20 shrink-0 self-start"
        >
          <MediaFrame src={imageSrc} alt={item.name} ratio="square" rounded="sm" />
        </a>
        <Stack gap="sm" className="min-w-0">
          <Text as="span" variant="lead" className="truncate">
            {item.name}
          </Text>
          <Text variant="small" tone="muted">
            {formatPrice(item.unitPriceAmount, currency, locale)}
          </Text>
          {!item.sufficientStock && (
            <Text variant="small" className="text-destructive" role="alert">
              {messages.insufficientStock}
            </Text>
          )}
        </Stack>
      </div>
      <Stack direction="horizontal" gap="sm" align="center">
        <Button
          variant="secondary"
          size="sm"
          disabled={pending || item.qty <= 1}
          aria-label={messages.decrease}
          onClick={() => {
            onUpdateQty(item.qty - 1);
          }}
        >
          −
        </Button>
        <Text variant="small" role="status" aria-label={messages.quantity}>
          {item.qty}
        </Text>
        <Button
          variant="secondary"
          size="sm"
          disabled={pending || item.qty >= item.availableQuantity}
          aria-label={messages.increase}
          onClick={() => {
            onUpdateQty(item.qty + 1);
          }}
        >
          +
        </Button>
        <Text as="span" variant="lead" className="min-w-24 text-right">
          {formatPrice(item.lineTotalAmount, currency, locale)}
        </Text>
        <Button variant="ghost" size="sm" disabled={pending} onClick={onRemove}>
          {messages.remove}
        </Button>
      </Stack>
    </li>
  );
}
