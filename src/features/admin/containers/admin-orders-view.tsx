'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { OrderStatusBadge } from '@/features/account/components/order-status-badge';
import { Pagination } from '@/features/catalog/components/pagination';
import type { AdminOrderList } from '@/lib/api/admin';
import { toAdminQuery } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';
import { formatPrice } from '@/lib/money/format';

export interface AdminOrdersQuery {
  status: string;
  page: number;
}

function formatPage(template: string, page: number, totalPages: number): string {
  return template.replace('{page}', String(page)).replace('{totalPages}', String(totalPages));
}

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

/**
 * Orders container: URL-driven status filter + pagination (server
 * re-fetches on navigation). Status changes happen on the detail page,
 * where the allowed transitions and confirmation are shown.
 */
export function AdminOrdersView({
  data,
  loadError,
  query,
  locale,
  messages,
}: {
  data: AdminOrderList | null;
  loadError: boolean;
  query: AdminOrdersQuery;
  locale: string;
  messages: Dictionary;
}) {
  const router = useRouter();
  const orders = messages.admin.orders;

  function navigate(next: Partial<AdminOrdersQuery>) {
    const merged: AdminOrdersQuery = { ...query, ...next };
    const search = toAdminQuery({
      ...(merged.status === '' ? {} : { status: merged.status }),
      page: merged.page,
    });
    router.push(`/${locale}/admin/ordenes${search}`);
  }

  return (
    <Stack gap="md">
      <Stack direction="horizontal" gap="md" align="end" wrap>
        <div className="min-w-44">
          <Select
            label={orders.statusFilter}
            name="status"
            value={query.status}
            options={[
              { value: '', label: orders.allStatuses },
              { value: 'PENDING_PAYMENT', label: messages.account.status_PENDING_PAYMENT },
              { value: 'PAID', label: messages.account.status_PAID },
              { value: 'PROCESSING', label: messages.account.status_PROCESSING },
              { value: 'SHIPPED', label: messages.account.status_SHIPPED },
              { value: 'DELIVERED', label: messages.account.status_DELIVERED },
              { value: 'CANCELLED', label: messages.account.status_CANCELLED },
            ]}
            onChange={(event) => {
              navigate({ status: event.target.value, page: 1 });
            }}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            navigate({ status: '', page: 1 });
          }}
        >
          {messages.catalog.clearFilters}
        </Button>
      </Stack>
      <Text variant="small" tone="muted">
        {orders.paidNote}
      </Text>
      {loadError || data === null ? (
        <Text role="alert" className="text-destructive">
          {messages.admin.loadError}
        </Text>
      ) : data.data.length === 0 ? (
        <Text tone="muted">{orders.empty}</Text>
      ) : (
        <Stack gap="md">
          <Text variant="small" tone="muted" role="status">
            {messages.admin.totalCount.replace('{count}', String(data.total))}
          </Text>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[52rem] border-collapse bg-surface text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">
                    {orders.tableOrder}
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">
                    {orders.tableDate}
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">
                    {orders.tableCustomer}
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">
                    {orders.tableStatus}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-medium text-muted-foreground"
                  >
                    {orders.tableItems}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-medium text-muted-foreground"
                  >
                    {orders.tableTotal}
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">
                    <span className="sr-only">{orders.tableActions}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <th
                      scope="row"
                      className="px-4 py-3 font-mono text-xs font-normal text-muted-foreground"
                    >
                      {order.id.slice(0, 8)}…
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(order.createdAt, locale)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{order.userId.slice(0, 8)}…</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} messages={messages.account} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{order.items.length}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums">
                      {formatPrice(order.totalAmount, order.currency, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/${locale}/admin/ordenes/${encodeURIComponent(order.id)}`}>
                        {orders.view}
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
