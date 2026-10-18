import { Badge } from '@/components/ui/badge';
import { Disclosure } from '@/components/ui/disclosure';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { AddToCartButton } from '@/features/cart/components/add-to-cart-button';
import type { ProductDetail } from '@/lib/api/catalog';
import type { Dictionary } from '@/lib/i18n/index';
import { formatPrice } from '@/lib/money/format';
import { formatSpecValue, humanizeSpecKey } from './spec-labels';

export interface ProductInfoProps {
  product: ProductDetail;
  locale: string;
  currency: string;
  messages: Dictionary['catalog'];
}

/** Buy box: brand readout, display name, mono price + stock signal, 1-tap CTA. */
export function ProductInfo({ product, locale, currency, messages }: ProductInfoProps) {
  const specs = Object.entries(product.specs as unknown as Record<string, unknown>);

  return (
    <Stack gap="md">
      <Stack gap="sm">
        <Text
          variant="caption"
          tone="muted"
          as="p"
          className="font-mono uppercase tracking-[0.12em]"
        >
          {product.brand.name} · {product.category.name}
        </Text>
        <Heading level={1} visual="title">
          {product.name}
        </Heading>
        <Stack direction="horizontal" gap="md" align="center" className="mt-1 flex-wrap">
          <Text variant="price-md" as="span">
            {formatPrice(product.priceAmount, currency, locale)}
          </Text>
          {product.inStock ? (
            <Badge tone="success">{messages.inStock}</Badge>
          ) : (
            <Badge tone="destructive">{messages.outOfStock}</Badge>
          )}
        </Stack>
        {product.inStock && product.availableQuantity > 0 && (
          <Text variant="small" tone="muted" role="status" className="font-mono">
            {messages.availableUnits.replace('{count}', String(product.availableQuantity))}
          </Text>
        )}
      </Stack>

      <div className="rounded-xl border border-primary/25 bg-primary-subtle p-4 shadow-md">
        <Stack gap="sm">
          <AddToCartButton
            productId={product.id}
            disabled={!product.inStock}
            label={messages.addToCart}
            addedLabel={messages.addToCartAdded}
            errorLabel={messages.addToCartError}
          />
          <Text
            variant="caption"
            tone="muted"
            as="p"
            className="font-mono uppercase tracking-[0.1em]"
          >
            SKU {product.sku}
          </Text>
        </Stack>
      </div>

      <Stack gap="sm">
        <Heading level={3}>{messages.descriptionTitle}</Heading>
        <Disclosure title={messages.descriptionToggle}>
          <Text tone="muted">{product.description}</Text>
        </Disclosure>
      </Stack>

      {specs.length > 0 && (
        <Stack gap="sm">
          <Heading level={3}>{messages.specsTitle}</Heading>
          <dl className="overflow-hidden rounded-md border border-border bg-surface shadow-md">
            {specs.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-1 gap-1 border-b border-border bg-surface px-4 py-3 last:border-b-0 sm:grid-cols-2 sm:gap-3"
              >
                <dt className="min-w-0 text-sm text-muted-foreground">
                  {humanizeSpecKey(key, messages.specLabels)}
                </dt>
                <dd className="min-w-0 break-words text-sm font-medium text-foreground sm:text-right">
                  {formatSpecValue(key, value)}
                </dd>
              </div>
            ))}
          </dl>
        </Stack>
      )}
    </Stack>
  );
}
