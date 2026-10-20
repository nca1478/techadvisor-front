import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PasswordResetNewContainer } from '@/features/auth/containers/password-reset-new-container';
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
  return { title: `${messages.auth.newPasswordTitle} — ${messages.common.techAdvisor}` };
}

/** Step 3 — set the new password (`?email=` carries the account). */
export default async function PasswordResetNewPage({ params, searchParams }: PageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const query = ((await searchParams) ?? {}) as { email?: unknown };
  const email = typeof query.email === 'string' ? query.email : '';
  const messages = await getDictionary(locale);
  return (
    <PasswordResetNewContainer
      locale={locale}
      email={email}
      copy={{
        title: messages.auth.newPasswordTitle,
        subtitleTemplate: messages.auth.newPasswordSubtitle,
        newPassword: messages.auth.newPasswordLabel,
        confirmPassword: messages.auth.confirmPasswordLabel,
        showPassword: messages.auth.showPassword,
        hidePassword: messages.auth.hidePassword,
        submit: messages.auth.resetSubmit,
        passwordMin: messages.auth.passwordMin,
        mismatch: messages.auth.passwordMismatch,
        required: messages.auth.required,
        backToLogin: messages.auth.backToLogin,
        successTitle: messages.auth.resetSuccessTitle,
        successBody: messages.auth.resetSuccessBody,
        loginCta: messages.auth.loginCta,
        invalidToken: messages.auth.invalidToken,
        genericError: messages.auth.resetGenericError,
      }}
    />
  );
}
