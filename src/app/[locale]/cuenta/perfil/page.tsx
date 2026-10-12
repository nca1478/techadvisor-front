import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ProfileEditContainer } from '@/features/account/containers/profile-edit-container';
import { getSessionUser } from '@/lib/auth/session';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface ProfilePageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.account.editTitle} — ${messages.common.techAdvisor}` };
}

/** Profile edit page: server-rendered identity, protected via the BFF session. */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const session = await getSessionUser();

  if (!session.authenticated || !session.user) {
    redirect(`/${locale}/ingresar?next=${encodeURIComponent(`/${locale}/cuenta/perfil`)}`);
  }

  // `UserResponseDto.name` arrives as `Record<string, never> | null` in the
  // generated contract (openapi-typescript for nullable strings): narrow
  // through `unknown` so a real string still pre-fills the form.
  const maybeName: unknown = session.user.name;
  const initialName = typeof maybeName === 'string' ? maybeName : '';

  return (
    <ProfileEditContainer
      locale={locale}
      email={session.user.email}
      initialName={initialName}
      messages={messages.account}
    />
  );
}
