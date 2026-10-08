import { Grid } from '@/components/ui/grid';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { ProductCard } from '@/features/catalog/components/product-card';
import type { Dictionary } from '@/lib/i18n/index';
import type { SearchResult } from '@/lib/api/search';

export interface SearchResultsProps {
  results: SearchResult[];
  locale: string;
  currency: string;
  catalogMessages: Dictionary['catalog'];
  searchMessages: Dictionary['search'];
  detailHrefFor: (slug: string) => string;
}

/**
 * Presentational search results: product cards (reused from the catalog, so
 * price/stock/CTA stay consistent) each followed by its evidence snippet.
 */
export function SearchResults({
  results,
  locale,
  currency,
  catalogMessages,
  searchMessages,
  detailHrefFor,
}: SearchResultsProps) {
  return (
    <Grid columns="products" gap="md">
      {results.map((result) => (
        <Stack key={result.product.id} gap="sm">
          <ProductCard
            product={result.product}
            locale={locale}
            currency={currency}
            messages={catalogMessages}
            detailHref={detailHrefFor(result.product.slug)}
          />
          <Text variant="small" tone="muted" as="p">
            <Text variant="small" as="span">
              {searchMessages.evidenceLabel}
            </Text>{' '}
            {result.snippet}
          </Text>
        </Stack>
      ))}
    </Grid>
  );
}
