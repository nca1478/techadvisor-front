'use client';

import { Container } from '@/components/ui/container';
import { Disclosure } from '@/components/ui/disclosure';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { CatalogBrand, CatalogCategory, PaginatedProducts } from '@/lib/api/catalog';
import { COMPARE_MAX_PRODUCTS } from '@/lib/api/compare';
import { CompareBar } from '@/features/compare/components/compare-bar';
import { useCompareSelection } from '@/features/compare/compare-selection-context';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/index';
import { CatalogEmpty, CatalogError } from '../components/catalog-states';
import { Pagination } from '../components/pagination';
import { ProductCardGrid } from '../components/product-card-grid';
import { ProductFilters } from '../components/product-filters';
import { useListingQuery } from '../hooks/use-listing-query';

export interface ProductListViewProps {
  initialData: PaginatedProducts | null;
  loadError: boolean;
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  locale: Locale;
  currency: string;
  messages: Dictionary;
  inStockOnly: boolean;
}

function formatCount(template: string, count: number): string {
  return template.replace('{count}', String(count));
}

/**
 * Listing view: presentational grid driven by server-fetched `initialData`.
 * Filters/pagination rewrite the URL (see `useListingQuery`) so a reload or
 * share preserves the view; the server re-fetches on navigation.
 */
export function ProductListView({
  initialData,
  loadError,
  categories,
  brands,
  locale,
  currency,
  messages,
  inStockOnly,
}: ProductListViewProps) {
  const { values, update, isPending } = useListingQuery();
  const compare = useCompareSelection();

  // La selección vive en el layout (sobrevive a la navegación), pero
  // pertenece al conjunto visible: cualquier cambio de página o filtro la
  // invalida y se limpia aquí, en el manejador del cambio.
  const resetCompareSelection = () => {
    if (compare.count > 0) compare.clear();
  };

  if (loadError || initialData === null) {
    return (
      <Container>
        <Section>
          <CatalogError title={messages.common.errorTitle} message={messages.catalog.loadError} />
        </Section>
      </Container>
    );
  }

  const { data, meta } = initialData;
  const visible = inStockOnly ? data.filter((product) => product.inStock) : data;
  const activeFilterCount =
    [values.q, values.category, values.brand, values.sort].filter((value) => value !== '').length +
    (values.inStockOnly ? 1 : 0);

  return (
    <Container>
      <Section spacing="tight">
        <Stack gap="md">
          <Stack gap="sm">
            <Heading level={1}>{messages.catalog.title}</Heading>
            <Text tone="muted">{messages.catalog.subtitle}</Text>
          </Stack>

          <Disclosure title={messages.catalog.filtersTitle} count={activeFilterCount}>
            <ProductFilters
              values={values}
              categories={categories}
              brands={brands}
              messages={messages.catalog}
              onChange={(next) => {
                resetCompareSelection();
                update({
                  q: next.q,
                  category: next.category,
                  brand: next.brand,
                  sort: next.sort,
                  inStockOnly: next.inStockOnly,
                });
              }}
              onClear={() => {
                resetCompareSelection();
                update({ q: '', category: '', brand: '', sort: '', inStockOnly: false, page: 1 });
              }}
            />
          </Disclosure>

          <Text variant="small" tone="muted" role="status">
            {formatCount(messages.catalog.results, meta.total)}
          </Text>

          <CompareBar
            count={compare.count}
            max={COMPARE_MAX_PRODUCTS}
            href={compare.compareHref(locale)}
            messages={messages.compare.bar}
            onClear={compare.clear}
          />

          {visible.length === 0 ? (
            <CatalogEmpty title={messages.common.emptyTitle} message={messages.catalog.empty} />
          ) : (
            <div
              aria-busy={isPending || undefined}
              className={isPending ? 'opacity-60' : undefined}
            >
              <ProductCardGrid
                products={visible}
                locale={locale}
                currency={currency}
                messages={messages.catalog}
                detailHrefFor={(slug) => `/${locale}/productos/${slug}`}
                columns="featured"
                compareFor={(product) => ({
                  checked: compare.isSelected(product.id),
                  disabled: !compare.canAdd(product.id),
                  messages: messages.compare.toggle,
                  onToggle: compare.toggle,
                })}
              />
            </div>
          )}

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(page) => {
              resetCompareSelection();
              update({ page });
            }}
            previousLabel="‹"
            nextLabel="›"
            statusLabel={(page, totalPages) => `${String(page)} / ${String(totalPages)}`}
          />
        </Stack>
      </Section>
    </Container>
  );
}
