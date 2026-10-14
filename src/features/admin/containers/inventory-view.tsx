'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { AdminFiltersCard, AdminHeaderCard } from '@/features/admin/components/admin-section';
import { Pagination } from '@/features/catalog/components/pagination';
import type { AdminProductList, AdminStockFilter } from '@/lib/api/admin';
import { availableUnits } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

function formatPage(template: string, page: number, totalPages: number): string {
  return template.replace('{page}', String(page)).replace('{totalPages}', String(totalPages));
}

/**
 * Inventory container: stock filter + paginated product table with exact
 * levels plus the selected product's adjust form and movement history
 * below. Filter, selection and pagination travel in the URL so the view
 * survives reloads (and the dashboard queue can link to it pre-filtered).
 */
export function InventoryView({
  data,
  loadError,
  page,
  stock,
  selectedProductId,
  locale,
  messages,
  panel,
}: {
  data: AdminProductList | null;
  loadError: boolean;
  page: number;
  stock: AdminStockFilter | null;
  selectedProductId: string | null;
  locale: string;
  messages: Dictionary;
  panel: React.ReactNode;
}) {
  const router = useRouter();
  const inventory = messages.admin.inventory;

  function navigate(next: {
    page?: number;
    stock?: AdminStockFilter | null;
    productId?: string | null;
  }) {
    const merged = {
      page: next.page ?? page,
      stock: next.stock === undefined ? stock : next.stock,
      productId: next.productId === undefined ? selectedProductId : next.productId,
    };
    const params = new URLSearchParams();
    params.set('page', String(merged.page));
    if (merged.stock !== null) params.set('stock', merged.stock);
    if (merged.productId) params.set('productId', merged.productId);
    // Sin scroll al principio: filtros y paginación viven junto a la tabla,
    // así que conservar la posición evita perderla (igual que en productos).
    router.push(`/${locale}/admin/inventario?${params.toString()}`, { scroll: false });
  }

  return (
    <Stack gap="md">
      <AdminHeaderCard title={inventory.title} subtitle={inventory.subtitle} />
      <AdminFiltersCard>
        <div className="min-w-44">
          <Select
            label={inventory.stockFilter}
            name="stock"
            value={stock ?? ''}
            options={[
              { value: '', label: inventory.allStock },
              { value: 'out_of_stock', label: inventory.stock_out_of_stock },
              { value: 'low_stock', label: inventory.stock_low_stock },
              { value: 'reserved', label: inventory.stock_reserved },
            ]}
            onChange={(event) => {
              const value = event.target.value as AdminStockFilter | '';
              // El producto seleccionado puede no estar en el listado
              // filtrado: al cambiar de filtro se limpia la selección.
              navigate({ stock: value === '' ? null : value, page: 1, productId: null });
            }}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            navigate({ stock: null, page: 1, productId: null });
          }}
        >
          {messages.catalog.clearFilters}
        </Button>
      </AdminFiltersCard>
      {loadError || data === null ? (
        <Text role="alert" className="text-destructive">
          {messages.admin.loadError}
        </Text>
      ) : data.data.length === 0 ? (
        <Text tone="muted">{messages.admin.products.empty}</Text>
      ) : (
        <Stack gap="md">
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[48rem] border-collapse bg-surface text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-sm font-bold text-muted-foreground"
                    >
                      {inventory.tableNumber}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {inventory.tableProduct}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-sm font-bold text-muted-foreground"
                    >
                      {inventory.tableStock}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-sm font-bold text-muted-foreground"
                    >
                      {inventory.tableReserved}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-sm font-bold text-muted-foreground"
                    >
                      {inventory.tableAvailable}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      <span className="sr-only">{inventory.tableActions}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((product, index) => {
                    const selected = product.id === selectedProductId;
                    return (
                      <tr key={product.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {(data.page - 1) * data.limit + index + 1}
                        </td>
                        <th scope="row" className="px-4 py-3 font-medium">
                          <Link
                            href={`/${locale}/admin/productos/${encodeURIComponent(product.id)}`}
                          >
                            {product.name}
                          </Link>
                          <Text variant="caption" tone="muted" as="span" className="block">
                            {product.sku}
                          </Text>
                        </th>
                        <td className="px-4 py-3 text-right tabular-nums">{product.stock}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{product.reserved}</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">
                          {availableUnits(product)}
                        </td>
                        <td className="px-4 py-3">
                          <Stack direction="horizontal" gap="md" align="center">
                            <Button
                              variant={selected ? 'primary' : 'secondary'}
                              size="sm"
                              onClick={() => {
                                navigate({ productId: selected ? null : product.id, page: 1 });
                              }}
                            >
                              {inventory.adjust}
                            </Button>
                            <Link
                              href={`/${locale}/admin/productos/${encodeURIComponent(product.id)}`}
                            >
                              {messages.admin.orders.edit}
                            </Link>
                          </Stack>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={(nextPage) => {
              navigate({ page: nextPage });
            }}
            previousLabel={messages.admin.previous}
            nextLabel={messages.admin.next}
            statusLabel={(current, total) => formatPage(messages.admin.pageOf, current, total)}
          />
        </Stack>
      )}
      {panel}
    </Stack>
  );
}
