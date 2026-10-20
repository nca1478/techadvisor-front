import { notFound } from 'next/navigation';
import { GoogleCallbackContainer } from '@/features/auth/containers/google-callback-container';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface CallbackPageProps {
  params: Promise<unknown>;
}

/**
 * Redirect target registered as the Google OAuth2 Authorized redirect URI
 * (see `GoogleSigninButton`). Kept separate from `/ingresar` so this page's
 * SSR output is only a spinner — never the login form.
 */
export default async function GoogleCallbackPage({ params }: CallbackPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  return <GoogleCallbackContainer locale={locale} pendingMessage={messages.auth.googleSigningIn} />;
}
