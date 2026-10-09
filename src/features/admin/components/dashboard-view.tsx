import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { OrderStatusBadge } from '@/features/account/components/order-status-badge';
import type { AdminOrder, AdminProduct } from '@/lib/api/admin';
import { availableUnits, LOW_STOCK_THRESHOLD } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';
import { formatPrice } from '@/lib/money/format';

/** Server presenter: recent orders + low-stock alerts, links into sections. */
export function DashboardView({
  recentOrders,
  lowStock,
  ordersError,
  productsError,
  locale,
  messages,
}: {
  recentOrders: AdminOrder[];
  lowStock: AdminProduct[];
  ordersError: boolean;
  productsError: boolean;
  locale: string;
  messages: Dictionary;
}) {
  const admin = messages.admin;
  const threshold = String(LOW_STOCK_THRESHOLD);
  return (
    <Stack gap="md">
      <Card>
        <Stack gap="sm">
          <Stack direction="horizontal" gap="md" align="center" justify="between">
            <Text variant="lead" as="div">
              {admin.dashboard.recentOrders}
            </Text>
            <Link href={`/${locale}/admin/ordenes`}>{admin.dashboard.viewAll}</Link>
          </Stack>
          {ordersError ? (
            <Text role="alert" className="text-destructive">
              {admin.loadError}
            </Text>
          ) : recentOrders.length === 0 ? (
            <Text tone="muted">{admin.dashboard.noOrders}</Text>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[36rem] border-collapse bg-surface text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                      {admin.dashboard.tableOrder}
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                      {admin.dashboard.tableStatus}
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                      {admin.dashboard.tableTotal}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border odd:bg-background last:border-0"
                    >
                      <th scope="row" className="px-4 py-3 font-normal">
                        <Link href={`/${locale}/admin/ordenes/${encodeURIComponent(order.id)}`}>
                          {order.id.slice(0, 8)}…
                        </Link>
                      </th>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} messages={messages.account} />
                      </td>
                      <td className="px-4 py-3">
                        {formatPrice(order.totalAmount, order.currency, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Stack>
      </Card>
      <Card>
        <Stack gap="sm">
          <Stack direction="horizontal" gap="md" align="center" justify="between">
            <Text variant="lead" as="div">
              {admin.dashboard.lowStock.replace('{threshold}', threshold)}
            </Text>
            <Link href={`/${locale}/admin/inventario`}>{admin.dashboard.viewAll}</Link>
          </Stack>
          {productsError ? (
            <Text role="alert" className="text-destructive">
              {admin.loadError}
            </Text>
          ) : lowStock.length === 0 ? (
            <Text tone="muted">{admin.dashboard.noLowStock}</Text>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[36rem] border-collapse bg-surface text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                      {admin.dashboard.tableProduct}
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                      {admin.dashboard.tableAvailable}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-border odd:bg-background last:border-0"
                    >
                      <th scope="row" className="px-4 py-3 font-normal">
                        <Link href={`/${locale}/admin/productos/${encodeURIComponent(product.id)}`}>
                          {product.name}
                        </Link>
                      </th>
                      <td className="px-4 py-3">{availableUnits(product)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
