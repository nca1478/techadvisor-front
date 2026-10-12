import { Grid } from '@/components/ui/grid';
import { ProductCard } from '@/features/catalog/components/product-card';
import type { Dictionary } from '@/lib/i18n/index';
import type { SearchResult } from '@/lib/api/search';

export interface SearchResultsProps {
  results: SearchResult[];
  locale: string;
  currency: string;
  catalogMessages: Dictionary['catalog'];
  detailHrefFor: (slug: string) => string;
}

/**
 * Presentational search results: product cards reused from the catalog, so
 * price/stock/CTA stay consistent. Cards only — no evidence snippets.
 */
export function SearchResults({
  results,
  locale,
  currency,
  catalogMessages,
  detailHrefFor,
}: SearchResultsProps) {
  return (
    <Grid columns="products" gap="md">
      {results.map((result) => (
        <ProductCard
          key={result.product.id}
          product={result.product}
          locale={locale}
          currency={currency}
          messages={catalogMessages}
          detailHref={detailHrefFor(result.product.slug)}
        />
      ))}
    </Grid>
  );
}
