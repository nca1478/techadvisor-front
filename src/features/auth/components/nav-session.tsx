'use client';

import { Link } from '@/components/ui/link';
import { Text } from '@/components/ui/text';
import { useSession } from '@/features/auth/session-context';

/**
 * Header session slot: loading skeleton, login/register links for guests,
 * and the account name + logout action for authenticated users.
 */
export function NavSession({
  locale,
  loginLabel,
  registerLabel,
  logoutLabel,
  accountLabel,
}: {
  locale: string;
  loginLabel: string;
  registerLabel: string;
  logoutLabel: string;
  accountLabel: string;
}) {
  const { status, user, logout } = useSession();

  if (status === 'loading') {
    return (
      <Text variant="small" tone="muted" aria-hidden="true">
        …
      </Text>
    );
  }

  if (status === 'authenticated' && user) {
    return (
      <span className="inline-flex items-center gap-3">
        <Link href={`/${locale}/cuenta`} variant="muted">
          {accountLabel.replace('{email}', user.email)}
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {logoutLabel}
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-3">
      <Link href={`/${locale}/ingresar`} variant="muted">
        {loginLabel}
      </Link>
      <Link href={`/${locale}/registro`} variant="muted">
        {registerLabel}
      </Link>
    </span>
  );
}
