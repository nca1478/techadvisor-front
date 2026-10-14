import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { CompareToggleMessages } from '@/features/compare/components/compare-toggle';
import type { ProductListItem } from '@/lib/api/catalog';
import type { Dictionary } from '@/lib/i18n/index';
import { ProductCard } from './product-card';

export interface CompareSlot {
  checked: boolean;
  disabled: boolean;
  messages: CompareToggleMessages;
  onToggle: (productId: string) => void;
}

export interface ProductCardGridProps {
  products: ProductListItem[];
  locale: string;
  currency: string;
  messages: Dictionary['catalog'];
  detailHrefFor: (slug: string) => string;
  compareFor?: (product: ProductListItem) => CompareSlot;
}

/** Presentational product grid (uses the `products` Grid preset). */
export function ProductCardGrid({
  products,
  locale,
  currency,
  messages,
  detailHrefFor,
  compareFor,
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
          compare={compareFor?.(product)}
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
          <div className="skeleton aspect-square w-full" />
          <Stack gap="sm" className="p-4">
            <div className="skeleton h-4 w-3/4 rounded-sm" />
            <div className="skeleton h-4 w-1/2 rounded-sm" />
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}

export function ProductGridEmpty({ message }: { message: string }) {
  return (
    <Card className="border-dashed">
      <Stack gap="sm" align="center" className="text-center">
        <Text tone="muted">{message}</Text>
      </Stack>
    </Card>
  );
}
