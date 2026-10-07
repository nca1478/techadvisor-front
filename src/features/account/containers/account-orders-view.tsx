'use client';

import { useMemo, useState } from 'react';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Section } from '@/components/ui/section';
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
 * Orders container: client-side pagination over the server-fetched order
 * list (the customer endpoint returns the whole array, newest first).
 * Error/empty states render from props; no client fetching here.
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
  messages: Dictionary;
}) {
  const [page, setPage] = useState(1);
  const account = messages.account;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((orders?.length ?? 0) / PAGE_SIZE)),
    [orders],
  );
  const safePage = Math.min(page, totalPages);
  const visible = useMemo(
    () => (orders ?? []).slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [orders, safePage],
  );

  return (
    <Container>
      <Section>
        <Stack gap="md">
          <Stack gap="sm">
            <Heading level={1}>{account.ordersTitle}</Heading>
            <Text tone="muted">{account.ordersSubtitle}</Text>
          </Stack>
          {loadError || orders === null ? (
            <Text role="alert" className="text-destructive">
              {account.loadError}
            </Text>
          ) : orders.length === 0 ? (
            <Stack gap="md">
              <Text tone="muted">{account.empty}</Text>
              <Link href={`/${locale}/productos`}>{account.browseProducts}</Link>
            </Stack>
          ) : (
            <Stack gap="md">
              <OrdersTable
                orders={visible}
                locale={locale}
                messages={account}
                detailHrefFor={(id) => `/${locale}/cuenta/ordenes/${encodeURIComponent(id)}`}
              />
              <Pagination
                page={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
                previousLabel={account.previous}
                nextLabel={account.next}
                statusLabel={(current, total) => formatPage(account.pageOf, current, total)}
              />
            </Stack>
          )}
        </Stack>
      </Section>
    </Container>
  );
}
