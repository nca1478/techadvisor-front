'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { Pagination } from '@/features/catalog/components/pagination';
import { ProductStatusContainer } from '@/features/admin/containers/product-status-container';
import type { AdminProductList, AdminProductStatus } from '@/lib/api/admin';
import { availableUnits, toAdminQuery } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';
import { formatPrice } from '@/lib/money/format';

export interface AdminProductsQuery {
  status: AdminProductStatus | '';
  q: string;
  page: number;
}

function formatPage(template: string, page: number, totalPages: number): string {
  return template.replace('{page}', String(page)).replace('{totalPages}', String(totalPages));
}

/**
 * Products container: URL-driven filters/pagination (server re-fetches on
 * navigation) + per-row status changes with confirmation. Row state after a
 * change refreshes from the server (`router.refresh`).
 */
export function AdminProductsView({
  data,
  loadError,
  query,
  locale,
  messages,
}: {
  data: AdminProductList | null;
  loadError: boolean;
  query: AdminProductsQuery;
  locale: string;
  messages: Dictionary;
}) {
  const router = useRouter();
  const products = messages.admin.products;
  const [draft, setDraft] = useState(query.q);

  function navigate(next: Partial<AdminProductsQuery>) {
    const merged: AdminProductsQuery = { ...query, ...next };
    const search = toAdminQuery({
      ...(merged.status === '' ? {} : { status: merged.status }),
      ...(merged.q === '' ? {} : { q: merged.q }),
      page: merged.page,
    });
    router.push(`/${locale}/admin/productos${search}`);
  }

  return (
    <Stack gap="md">
      <Stack direction="horizontal" gap="md" align="end" justify="between" wrap>
        <Stack direction="horizontal" gap="md" align="end" wrap>
          <div className="min-w-56">
            <Input
              label={products.searchPlaceholder}
              name="q"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') navigate({ q: draft.trim(), page: 1 });
              }}
            />
          </div>
          <div className="min-w-44">
            <Select
              label={products.statusFilter}
              name="status"
              value={query.status}
              options={[
                { value: '', label: products.allStatuses },
                { value: 'DRAFT', label: products.status_DRAFT },
                { value: 'ACTIVE', label: products.status_ACTIVE },
                { value: 'ARCHIVED', label: products.status_ARCHIVED },
              ]}
              onChange={(event) => {
                navigate({ status: event.target.value as AdminProductsQuery['status'], page: 1 });
              }}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setDraft('');
              navigate({ status: '', q: '', page: 1 });
            }}
          >
            {messages.catalog.clearFilters}
          </Button>
        </Stack>
        <Button href={`/${locale}/admin/productos/nuevo`}>{products.newProduct}</Button>
      </Stack>
      {loadError || data === null ? (
        <Text role="alert" className="text-destructive">
          {messages.admin.loadError}
        </Text>
      ) : data.data.length === 0 ? (
        <Text tone="muted">{products.empty}</Text>
      ) : (
        <Stack gap="md">
          <Text variant="small" tone="muted" role="status">
            {messages.admin.totalCount.replace('{count}', String(data.total))}
          </Text>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[56rem] border-collapse bg-surface text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">
                    {products.tableProduct}
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">
                    {products.tableSku}
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">
                    {products.tableStatus}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-medium text-muted-foreground"
                  >
                    {products.tablePrice}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-medium text-muted-foreground"
                  >
                    {products.tableStock}
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">
                    <span className="sr-only">{products.tableActions}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((product) => (
                  <tr key={product.id} className="border-b border-border align-top last:border-0">
                    <th scope="row" className="px-4 py-3 font-normal">
                      <Link href={`/${locale}/admin/productos/${encodeURIComponent(product.id)}`}>
                        {product.name}
                      </Link>
                    </th>
                    <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                    <td className="px-4 py-3">
                      <ProductStatusContainer
                        productId={product.id}
                        initialStatus={product.status}
                        messages={messages}
                        onChanged={() => {
                          router.refresh();
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {formatPrice(product.priceAmount, product.currency, locale)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {products.outOfStock.replace('{count}', String(availableUnits(product)))}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/${locale}/admin/productos/${encodeURIComponent(product.id)}`}>
                        {products.edit}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={(page) => {
              navigate({ page });
            }}
            previousLabel={messages.admin.previous}
            nextLabel={messages.admin.next}
            statusLabel={(current, total) => formatPage(messages.admin.pageOf, current, total)}
          />
        </Stack>
      )}
    </Stack>
  );
}
