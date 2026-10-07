import { notFound, redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { AdminNav } from '@/features/admin/components/admin-nav';
import { getSessionUser } from '@/lib/auth/session';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface AdminLayoutProps {
  children: ReactNode;
  params: Promise<unknown>;
}

/**
 * Server-side admin guard: anonymous users go to login (with `next=` back to
 * the panel); authenticated non-admins are redirected to the store home.
 * The backend re-enforces `ADMIN` on every `/admin/*` route — this layout
 * only improves the experience, never the security boundary.
 */
export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const session = await getSessionUser();

  if (!session.authenticated) {
    redirect(`/${locale}/ingresar?next=${encodeURIComponent(`/${locale}/admin`)}`);
  }
  if (session.user?.role !== 'ADMIN') {
    redirect(`/${locale}`);
  }

  return (
    <Container>
      <Section>
        <Stack gap="md">
          <Stack gap="sm">
            <Heading level={1}>{messages.admin.title}</Heading>
            <Text tone="muted">{messages.admin.subtitle}</Text>
          </Stack>
          <AdminNav locale={locale} messages={messages.admin} />
          {children}
        </Stack>
      </Section>
    </Container>
  );
}
