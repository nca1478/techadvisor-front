import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
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
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 gap-4">
        <a
          href={`/${locale}/productos/${item.slug}`}
          aria-label={messages.productLink}
          className="w-20 shrink-0 self-start"
        >
          <MediaFrame src={imageSrc} alt={item.name} ratio="square" rounded="md" lift />
        </a>
        <Stack gap="sm" className="min-w-0">
          <Link
            href={`/${locale}/productos/${item.slug}`}
            title={item.name}
            className="truncate no-underline"
          >
            <Text as="span" variant="body" className="truncate font-medium">
              {item.name}
            </Text>
          </Link>
          <Text variant="small" tone="muted" className="price">
            {formatPrice(item.unitPriceAmount, currency, locale)}
          </Text>
          {!item.sufficientStock && (
            <Text variant="small" className="text-destructive" role="alert">
              {messages.insufficientStock}
            </Text>
          )}
        </Stack>
      </div>
      <Stack direction="horizontal" gap="sm" align="center" className="flex-wrap">
        <div
          role="group"
          aria-label={messages.quantity}
          className="flex items-center rounded-lg border border-border bg-background"
        >
          <Button
            variant="ghost"
            size="sm"
            disabled={pending || item.qty <= 1}
            aria-label={messages.decrease}
            onClick={() => {
              onUpdateQty(item.qty - 1);
            }}
          >
            −
          </Button>
          <Text variant="small" role="status" className="price min-w-8 text-center">
            {item.qty}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending || item.qty >= item.availableQuantity}
            aria-label={messages.increase}
            onClick={() => {
              onUpdateQty(item.qty + 1);
            }}
          >
            +
          </Button>
        </div>
        <Text as="span" variant="price" className="min-w-24 text-right">
          {formatPrice(item.lineTotalAmount, currency, locale)}
        </Text>
        <Button variant="ghost" size="sm" disabled={pending} onClick={onRemove}>
          {messages.remove}
        </Button>
      </Stack>
    </li>
  );
}
