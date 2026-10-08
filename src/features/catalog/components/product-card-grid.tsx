import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { ProductListItem } from '@/lib/api/catalog';
import type { Dictionary } from '@/lib/i18n/index';
import { ProductCard } from './product-card';

export interface ProductCardGridProps {
  products: ProductListItem[];
  locale: string;
  currency: string;
  messages: Dictionary['catalog'];
  detailHrefFor: (slug: string) => string;
}

/** Presentational product grid (uses the `products` Grid preset). */
export function ProductCardGrid({
  products,
  locale,
  currency,
  messages,
  detailHrefFor,
}: ProductCardGridProps) {
  return (
    <Grid columns="products" gap="md">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
          currency={currency}
          messages={messages}
          detailHref={detailHrefFor(product.slug)}
        />
      ))}
    </Grid>
  );
}

export function ProductGridSkeleton({
  count = 8,
  loadingLabel,
}: {
  count?: number;
  loadingLabel: string;
}) {
  return (
    <Grid columns="products" gap="md" aria-busy="true" aria-label={loadingLabel}>
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} padding="none" aria-hidden="true">
          <div className="aspect-square w-full bg-surface" />
          <Stack gap="sm" className="p-4">
            <div className="h-4 w-3/4 rounded-sm bg-surface" />
            <div className="h-4 w-1/2 rounded-sm bg-surface" />
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}

export function ProductGridEmpty({ message }: { message: string }) {
  return (
    <Card>
      <Stack gap="sm" align="center">
        <Text tone="muted">{message}</Text>
      </Stack>
    </Card>
  );
}
