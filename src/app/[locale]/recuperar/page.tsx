import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PasswordResetRequestContainer } from '@/features/auth/containers/password-reset-request-container';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface PageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.auth.resetRequestTitle} — ${messages.common.techAdvisor}` };
}

/** Step 1 — enter the account email to receive the OTP code. */
export default async function PasswordResetRequestPage({ params }: PageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  return (
    <PasswordResetRequestContainer
      locale={locale}
      copy={{
        title: messages.auth.resetRequestTitle,
        subtitle: messages.auth.resetRequestSubtitle,
        emailLabel: messages.auth.email,
        submit: messages.auth.sendCode,
        invalidEmail: messages.auth.invalidEmail,
        required: messages.auth.required,
        sentTitle: messages.auth.codeSentTitle,
        sentBody: messages.auth.codeSentBody,
        continueCta: messages.auth.continueToCode,
        emailNotFound: messages.auth.emailNotFound,
        passwordNotAllowed: messages.auth.passwordNotAllowed,
        backToLogin: messages.auth.backToLogin,
        genericError: messages.auth.resetGenericError,
        rateLimitError: messages.auth.rateLimitError,
      }}
    />
  );
}
