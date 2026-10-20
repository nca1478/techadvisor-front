import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PasswordResetVerifyContainer } from '@/features/auth/containers/password-reset-verify-container';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface PageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.auth.verifyTitle} — ${messages.common.techAdvisor}` };
}

/** Step 2 — enter the 6-digit OTP (`?email=` carries the account). */
export default async function PasswordResetVerifyPage({ params, searchParams }: PageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const query = ((await searchParams) ?? {}) as { email?: unknown };
  const email = typeof query.email === 'string' ? query.email : '';
  const messages = await getDictionary(locale);
  return (
    <PasswordResetVerifyContainer
      locale={locale}
      email={email}
      copy={{
        title: messages.auth.verifyTitle,
        subtitleTemplate: messages.auth.verifySubtitle,
        verify: messages.auth.verifySubmit,
        resend: messages.auth.resendCode,
        resendCooldownTemplate: messages.auth.resendCooldown,
        changeEmail: messages.auth.changeEmail,
        invalidCode: messages.auth.invalidCode,
        expiredCode: messages.auth.expiredCode,
        genericError: messages.auth.resetGenericError,
        rateLimitError: messages.auth.rateLimitError,
      }}
    />
  );
}
