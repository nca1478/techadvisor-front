'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { AdminHeaderCard } from '@/features/admin/components/admin-section';
import { Pagination } from '@/features/catalog/components/pagination';
import type { AdminProductList } from '@/lib/api/admin';
import { availableUnits } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

function formatPage(template: string, page: number, totalPages: number): string {
  return template.replace('{page}', String(page)).replace('{totalPages}', String(totalPages));
}

/**
 * Inventory container: paginated product table with exact levels plus the
 * selected product's adjust form and movement history below. Selection and
 * pagination travel in the URL so the view survives reloads.
 */
export function InventoryView({
  data,
  loadError,
  page,
  selectedProductId,
  locale,
  messages,
  panel,
}: {
  data: AdminProductList | null;
  loadError: boolean;
  page: number;
  selectedProductId: string | null;
  locale: string;
  messages: Dictionary;
  panel: React.ReactNode;
}) {
  const router = useRouter();
  const inventory = messages.admin.inventory;

  function navigate(next: { page?: number; productId?: string | null }) {
    const params = new URLSearchParams();
    params.set('page', String(next.page ?? page));
    const productId = next.productId === undefined ? selectedProductId : next.productId;
    if (productId) params.set('productId', productId);
    router.push(`/${locale}/admin/inventario?${params.toString()}`);
  }

  return (
    <Stack gap="md">
      <AdminHeaderCard title={inventory.title} subtitle={inventory.subtitle} />
      {loadError || data === null ? (
        <Text role="alert" className="text-destructive">
          {messages.admin.loadError}
        </Text>
      ) : data.data.length === 0 ? (
        <Text tone="muted">{messages.admin.products.empty}</Text>
      ) : (
        <Stack gap="md">
          <Text variant="small" tone="muted" role="status">
            {messages.admin.totalCount.replace('{count}', String(data.total))}
          </Text>
          <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] border-collapse bg-surface text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-sm font-bold text-muted-foreground"
                  >
                    {inventory.tableNumber}
                  </th>
                    {inventory.tableProduct}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-medium text-muted-foreground"
                  >
                    {inventory.tableStock}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-medium text-muted-foreground"
                  >
                    {inventory.tableReserved}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-medium text-muted-foreground"
                  >
                    {inventory.tableAvailable}
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">
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
                        {product.name}
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
                        <Stack direction="horizontal" gap="md">
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
