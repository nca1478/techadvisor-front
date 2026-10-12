import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { OrderDetail, formatOrderDate } from '@/features/account/components/orders-table';
import { OrderStatusBadge } from '@/features/account/components/order-status-badge';
import { backendFetch } from '@/lib/api/backend';
import type { Order } from '@/lib/api/orders';
import { getSessionUser } from '@/lib/auth/session';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface OrderDetailPageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.account.ordersTitle} — ${messages.common.techAdvisor}` };
}

function isOrder(value: unknown): value is Order {
  return value !== null && typeof value === 'object' && 'id' in value && 'status' in value;
}

/** Customer order detail: status + frozen items + shipping address. */
export default async function AccountOrderDetailPage({ params }: OrderDetailPageProps) {
  const resolved = (await params) as { locale?: unknown; id?: unknown };
  if (!isLocale(resolved.locale) || typeof resolved.id !== 'string') {
    notFound();
  }
  const locale = resolved.locale;
  const id = resolved.id;
  const messages = await getDictionary(locale);
  const session = await getSessionUser();
  if (!session.authenticated) {
    redirect(
      `/${locale}/ingresar?next=${encodeURIComponent(`/${locale}/cuenta/ordenes/${encodeURIComponent(id)}`)}`,
    );
  }

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  const result = await backendFetch(`/orders/${encodeURIComponent(id)}`, {
    method: 'GET',
    cookieHeader,
  });
  if (result.status === 404) {
    notFound();
  }
  const order = result.status === 200 && isOrder(result.body) ? result.body : null;

  return (
    <Container>
      <Section>
        <Stack gap="md">
          <Link href={`/${locale}/cuenta/ordenes`}>{messages.account.backToOrders}</Link>
          {order === null ? (
            <Stack gap="sm">
              <Heading level={1}>{messages.account.ordersTitle}</Heading>
              <Text role="alert" className="text-destructive">
                {messages.account.detailError}
              </Text>
            </Stack>
          ) : (
            <Stack gap="md">
              <Stack direction="horizontal" gap="md" align="center" justify="between" wrap>
                <Heading level={1}>
                  {messages.account.detailTitle.replace('{id}', order.id.slice(0, 8))}
                </Heading>
                <Stack direction="horizontal" gap="md" align="center">
                  <OrderStatusBadge status={order.status} messages={messages.account} />
                  <Text variant="small" tone="muted">
                    {formatOrderDate(order.createdAt, locale)}
                  </Text>
                </Stack>
              </Stack>
              <OrderDetail order={order} locale={locale} messages={messages.account} />
            </Stack>
          )}
        </Stack>
      </Section>
    </Container>
  );
}
