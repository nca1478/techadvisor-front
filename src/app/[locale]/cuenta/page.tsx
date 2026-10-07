import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { ProfileCard } from '@/features/account/components/profile-card';
import { getSessionUser } from '@/lib/auth/session';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

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

/** Profile page: server-rendered identity, protected via the BFF session. */
export default async function AccountPage({ params }: AccountPageProps) {
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

  return (
    <Container>
      <Section>
        <Stack gap="md">
          <Stack gap="sm">
            <Heading level={1}>{messages.account.title}</Heading>
            <Text tone="muted">{messages.account.subtitle}</Text>
          </Stack>
          <ProfileCard user={session.user} locale={locale} messages={messages.account} />
        </Stack>
      </Section>
    </Container>
  );
}
