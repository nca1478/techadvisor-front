'use client';

import { Button } from '@/components/ui/button';
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
  accountShortLabel,
  adminLabel,
}: {
  locale: string;
  loginLabel: string;
  registerLabel: string;
  logoutLabel: string;
  accountShortLabel: string;
  adminLabel: string;
}) {
  const { status, user, logout } = useSession();

  if (status === 'loading') {
    return (
      <Text variant="small" tone="headerMuted" aria-hidden="true">
        …
      </Text>
    );
  }

  if (status === 'authenticated' && user) {
    return (
      <span className="inline-flex items-center gap-3">
        {user.role === 'ADMIN' ? (
          <Link href={`/${locale}/admin`} variant="header">
            {adminLabel}
          </Link>
        ) : null}
        <Link href={`/${locale}/cuenta`} variant="header">
          {accountShortLabel}
        </Link>
        <Button variant="danger" size="sm" onClick={() => void logout()}>
          {logoutLabel}
        </Button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-3">
      <Link href={`/${locale}/ingresar`} variant="header">
        {loginLabel}
      </Link>
      <Link href={`/${locale}/registro`} variant="header">
        {registerLabel}
      </Link>
    </span>
  );
}
