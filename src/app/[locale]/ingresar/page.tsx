import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LoginContainer } from '@/features/auth/containers/login-container';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface AuthPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

/** Only same-site paths are accepted as post-login destinations. */
function resolveNext(value: unknown, locale: string): string {
  const raw = (value as { next?: unknown } | null)?.next;
  const candidate = Array.isArray(raw) ? (raw[0] as unknown) : raw;
  if (typeof candidate === 'string' && candidate.startsWith('/') && !candidate.startsWith('//')) {
    return candidate;
  }
  return `/${locale}`;
}

export async function generateMetadata({ params }: AuthPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.auth.loginTitle} — ${messages.common.techAdvisor}` };
}

/** Localized sign-in page; `?next=` carries the post-login destination. */
export default async function LoginPage({ params, searchParams }: AuthPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const query = ((await searchParams) ?? {}) as { next?: unknown };
  const messages = await getDictionary(locale);
  return (
    <LoginContainer
      locale={locale}
      next={resolveNext(query, locale)}
      title={messages.auth.loginTitle}
      subtitle={messages.auth.loginSubtitle}
      noAccountPrompt={messages.auth.noAccount}
      registerCta={messages.auth.createAccountCta}
      forgotLink={messages.auth.forgotLink}
      messages={{
        email: messages.auth.email,
        password: messages.auth.password,
        submit: messages.auth.loginSubmit,
        invalidEmail: messages.auth.invalidEmail,
        required: messages.auth.required,
      }}
      google={{
        clientId: process.env['NEXT_PUBLIC_GOOGLE_CLIENT_ID'] ?? '',
        divider: messages.auth.googleDivider,
        buttonLabel: messages.auth.googleButtonLabel,
        error: messages.auth.googleError,
      }}
    />
  );
}
