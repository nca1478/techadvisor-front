'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { Pagination } from '@/features/catalog/components/pagination';
import type { Order } from '@/lib/api/orders';
import type { Dictionary } from '@/lib/i18n/index';
import { OrdersTable } from '../components/orders-table';

const PAGE_SIZE = 10;

function formatPage(template: string, page: number, totalPages: number): string {
  return template.replace('{page}', String(page)).replace('{totalPages}', String(totalPages));
}

/**
 * Orders content: client-side pagination over the server-fetched order
 * list (the customer endpoint returns the whole array, newest first).
 * Layout-free (no Container/Section/Heading) so it embeds in the account
 * tab panel; error/empty states render from props, no client fetching here.
 */
export function AccountOrdersView({
  orders,
  loadError,
  locale,
  messages,
}: {
  orders: Order[] | null;
  loadError: boolean;
  locale: string;
  messages: Dictionary['account'];
}) {
  const [page, setPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((orders?.length ?? 0) / PAGE_SIZE)),
    [orders],
  );
  const safePage = Math.min(page, totalPages);
  const visible = useMemo(
    () => (orders ?? []).slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [orders, safePage],
  );

  if (loadError || orders === null) {
    return (
      <Text role="alert" className="text-destructive">
        {messages.loadError}
      </Text>
    );
  }

  if (orders.length === 0) {
    return (
      <Stack gap="md">
        <Text tone="muted">{messages.empty}</Text>
        <Link href={`/${locale}/productos`}>{messages.browseProducts}</Link>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <OrdersTable
        orders={visible}
        locale={locale}
        messages={messages}
        detailHrefFor={(id) => `/${locale}/cuenta/ordenes/${encodeURIComponent(id)}`}
        rowOffset={(safePage - 1) * PAGE_SIZE}
      />
      <Pagination
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        previousLabel={messages.previous}
        nextLabel={messages.next}
        statusLabel={(current, total) => formatPage(messages.pageOf, current, total)}
        alwaysVisible
      />
    </Stack>
  );
}
