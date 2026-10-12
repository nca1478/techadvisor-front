import { notFound, redirect } from 'next/navigation';
import { isLocale, LOCALES } from '@/lib/i18n/config';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface ProfileRedirectProps {
  params: Promise<unknown>;
}

/**
 * Legacy edit-profile URL: the account page now shows the edit form
 * directly in its default profile tab, so this route redirects there.
 */
export default async function ProfileRedirect({ params }: ProfileRedirectProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  redirect(`/${resolved.locale}/cuenta`);
}
