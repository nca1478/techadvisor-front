import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { AccountView } from '@/features/account/containers/account-view';
import { normalizeAccountTab } from '@/features/account/account-tab';
import { backendFetch } from '@/lib/api/backend';
import type { Order } from '@/lib/api/orders';
import { getSessionUser } from '@/lib/auth/session';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface AccountPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
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

/** Account page: profile (default) and orders as tabs, protected via the BFF session. */
export default async function AccountPage({ params, searchParams }: AccountPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const session = await getSessionUser();

  if (!session.authenticated || !session.user) {
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

  const query = (await searchParams) as { tab?: unknown };
  const defaultTab = normalizeAccountTab(query.tab);

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
          <AccountView
            user={session.user}
            orders={orders}
            loadError={orders === null}
            locale={locale}
            defaultTab={defaultTab}
            messages={messages.account}
          />
        </Stack>
      </Section>
    </Container>
  );
}
