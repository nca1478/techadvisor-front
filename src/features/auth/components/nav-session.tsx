'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Link } from '@/components/ui/link';
import { LogoutIcon, ShieldIcon, UserIcon, UserPlusIcon } from '@/components/ui/header-icons';
import { Text } from '@/components/ui/text';
import { useSession } from '@/features/auth/session-context';

/**
 * Header session slot as icons (reference layout): login / register icons
 * for guests, and account + logout icons for authenticated users.
 * Text labels stay as tooltips + screen-reader names.
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
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Cierra sesión y fuerza el re-renderizado del servidor: sin
   * `router.refresh()` las páginas privadas (`/cuenta`, `/admin`,
   * `/checkout`) seguirían mostrando el contenido cacheado del usuario.
   * Si ya estamos en una ruta privada, volvemos al inicio.
   */
  async function handleLogout() {
    await logout();
    const privateRoots = [`/${locale}/cuenta`, `/${locale}/admin`, `/${locale}/checkout`];
    if (privateRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`))) {
      router.push(`/${locale}`);
    }
    router.refresh();
  }

  if (status === 'loading') {
    return (
      <Text variant="small" tone="headerMuted" aria-hidden="true">
        …
      </Text>
    );
  }

  if (status === 'authenticated' && user) {
    return (
      <span className="inline-flex items-center gap-2 sm:gap-3">
        {user.role === 'ADMIN' ? (
          <Link
            href={`/${locale}/admin`}
            variant="header"
            ariaLabel={adminLabel}
            className="inline-flex p-1"
          >
            <span title={adminLabel}>
              <ShieldIcon className="size-6" />
            </span>
            <span className="sr-only">{adminLabel}</span>
          </Link>
        ) : null}
        <Link
          href={`/${locale}/cuenta`}
          variant="header"
          ariaLabel={accountShortLabel}
          className="inline-flex p-1"
        >
          <span title={accountShortLabel}>
            <UserIcon className="size-6" />
          </span>
          <span className="sr-only">{accountShortLabel}</span>
        </Link>
        <button
          type="button"
          onClick={() => void handleLogout()}
          aria-label={logoutLabel}
          title={logoutLabel}
          className="inline-flex cursor-pointer rounded-sm p-1 text-header-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <LogoutIcon className="size-6" />
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 sm:gap-3">
      <Link
        href={`/${locale}/ingresar`}
        variant="header"
        ariaLabel={loginLabel}
        className="inline-flex p-1"
      >
        <span title={loginLabel}>
          <UserIcon className="size-6" />
        </span>
        <span className="sr-only">{loginLabel}</span>
      </Link>
      <Link
        href={`/${locale}/registro`}
        variant="header"
        ariaLabel={registerLabel}
        className="inline-flex p-1"
      >
        <span title={registerLabel}>
          <UserPlusIcon className="size-6" />
        </span>
        <span className="sr-only">{registerLabel}</span>
      </Link>
    </span>
  );
}
