import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { backendFetch } from '@/lib/api/backend';
import type { Order } from '@/lib/api/orders';
import { getSessionUser } from '@/lib/auth/session';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';
import { formatPrice } from '@/lib/money/format';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface AccountPageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: AccountPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.account.title} — ${messages.common.techAdvisor}` };
}

function isOrderList(value: unknown): value is Order[] {
  return Array.isArray(value);
}

/** Account page: server-rendered order list, protected via the BFF session. */
export default async function AccountPage({ params }: AccountPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const session = await getSessionUser();

  if (!session.authenticated) {
    return (
      <Container>
        <Section>
          <Stack gap="md" className="mx-auto w-full max-w-md">
            <Heading level={1}>{messages.account.title}</Heading>
            <Text tone="muted">{messages.account.loginRequired}</Text>
            <Link href={`/${locale}/ingresar?next=${encodeURIComponent(`/${locale}/cuenta`)}`}>
              {messages.account.loginLink}
            </Link>
          </Stack>
        </Section>
      </Container>
    );
  }

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  const result = await backendFetch('/orders', { method: 'GET', cookieHeader });
  const orders = result.status === 200 && isOrderList(result.body) ? result.body : null;

  return (
    <Container>
      <Section>
        <Stack gap="md">
          <Stack gap="sm">
            <Heading level={1}>{messages.account.title}</Heading>
            <Text tone="muted">{messages.account.subtitle}</Text>
          </Stack>
          {orders === null ? (
            <Text className="text-destructive" role="alert">
              {messages.common.errorTitle}
            </Text>
          ) : orders.length === 0 ? (
            <Stack gap="md">
              <Text tone="muted">{messages.account.empty}</Text>
              <Link href={`/${locale}/productos`}>{messages.account.browseProducts}</Link>
            </Stack>
          ) : (
            <ul className="flex flex-col gap-3">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-col gap-2 rounded-md border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <Stack gap="sm">
                    <Text as="span">{messages.account.orderLabel.replace('{id}', order.id)}</Text>
                    <Text variant="small" tone="muted">
                      {order.status} · {formatPrice(order.totalAmount, order.currency, locale)}
                    </Text>
                  </Stack>
                  <Link href={`/${locale}/checkout/exito?orderId=${encodeURIComponent(order.id)}`}>
                    {messages.account.viewOrder}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Stack>
      </Section>
    </Container>
  );
}
