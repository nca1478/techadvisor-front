import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { ProductDetail } from '@/lib/api/catalog';
import type { Dictionary } from '@/lib/i18n/index';
import { formatPrice } from '@/lib/money/format';

export interface ProductInfoProps {
  product: ProductDetail;
  locale: string;
  currency: string;
  messages: Dictionary['catalog'];
}

/** Presentational detail block: name, brand, price, stock, specs. */
export function ProductInfo({ product, locale, currency, messages }: ProductInfoProps) {
  const specs = Object.entries(product.specs as unknown as Record<string, unknown>);

  return (
    <Stack gap="md">
      <Stack gap="sm">
        <Text variant="small" tone="muted">
          {product.brand.name} · {product.category.name}
        </Text>
        <Heading level={1}>{product.name}</Heading>
        <Stack direction="horizontal" gap="sm" align="center">
          <Text variant="lead" as="span">
            {formatPrice(product.priceAmount, currency, locale)}
          </Text>
          {product.inStock ? (
            <Badge tone="success">{messages.inStock}</Badge>
          ) : (
            <Badge tone="destructive">{messages.outOfStock}</Badge>
          )}
        </Stack>
        {product.inStock && product.availableQuantity > 0 && (
          <Text variant="small" tone="muted" role="status">
            {messages.availableUnits.replace('{count}', String(product.availableQuantity))}
          </Text>
        )}
      </Stack>

      <Stack gap="sm">
        <Button size="lg" disabled title={messages.addToCartUnavailable}>
          {product.inStock ? messages.addToCart : messages.outOfStock}
        </Button>
        <Text variant="caption" tone="muted">
          {messages.addToCartUnavailable}
        </Text>
      </Stack>

      <Stack gap="sm">
        <Heading level={3}>{messages.descriptionTitle}</Heading>
        <Text tone="muted">{product.description}</Text>
      </Stack>

      {specs.length > 0 && (
        <Stack gap="sm">
          <Heading level={3}>{messages.specsTitle}</Heading>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {specs.map(([key, value]) => (
              <div key={key} className="rounded-md border border-border bg-surface p-4">
                <dt className="text-xs text-muted-foreground">{key}</dt>
                <dd className="text-sm font-medium text-foreground">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </Stack>
      )}
    </Stack>
  );
}
