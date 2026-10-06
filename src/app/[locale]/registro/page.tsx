import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RegisterContainer } from '@/features/auth/containers/register-container';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface AuthPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

/** Only same-site paths are accepted as post-registration destinations. */
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
  return { title: `${messages.auth.registerTitle} — ${messages.common.techAdvisor}` };
}

/** Localized registration page; `?next=` carries the post-signup destination. */
export default async function RegisterPage({ params, searchParams }: AuthPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const query = ((await searchParams) ?? {}) as { next?: unknown };
  const messages = await getDictionary(locale);
  return (
    <RegisterContainer
      locale={locale}
      next={resolveNext(query, locale)}
      title={messages.auth.registerTitle}
      subtitle={messages.auth.registerSubtitle}
      messages={{
        email: messages.auth.email,
        password: messages.auth.password,
        name: messages.auth.name,
        submit: messages.auth.registerSubmit,
        invalidEmail: messages.auth.invalidEmail,
        passwordMin: messages.auth.passwordMin,
      }}
    />
  );
}
