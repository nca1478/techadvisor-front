'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Link } from '@/components/ui/link';
import { LogoutIcon, ShieldIcon, UserIcon, UserPlusIcon } from '@/components/ui/header-icons';
import { Text } from '@/components/ui/text';
import { useSession } from '@/features/auth/session-context';

/**
 * Header session slot as icons (reference layout): login / register icons
 * for guests, and account + logout icons for authenticated users.
 * Text labels stay as tooltips + screen-reader names, unless `showLabel`
 * renders them visible (mobile menu rows, one icon per line).
 */
export function NavSession({
  locale,
  loginLabel,
  registerLabel,
  logoutLabel,
  accountShortLabel,
  adminLabel,
  showLabel = false,
}: {
  locale: string;
  loginLabel: string;
  registerLabel: string;
  logoutLabel: string;
  accountShortLabel: string;
  adminLabel: string;
  /** Visible text labels stacked one row per icon (mobile menu); icon-only otherwise. */
  showLabel?: boolean;
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
      <span
        className={
          showLabel
            ? 'flex w-full flex-col items-stretch gap-1'
            : 'inline-flex items-center gap-2 sm:gap-3'
        }
      >
        {user.role === 'ADMIN' ? (
          <Link
            href={`/${locale}/admin`}
            variant="header"
            ariaLabel={adminLabel}
            className={
              showLabel ? 'inline-flex w-full items-center gap-3 px-1 py-1.5' : 'inline-flex p-1'
            }
          >
            <span title={adminLabel}>
              <ShieldIcon className="size-6" />
            </span>
            {showLabel ? (
              <span aria-hidden="true" className="text-sm">
                {adminLabel}
              </span>
            ) : (
              <span className="sr-only">{adminLabel}</span>
            )}
          </Link>
        ) : null}
        <Link
          href={`/${locale}/cuenta`}
          variant="header"
          ariaLabel={accountShortLabel}
          className={
            showLabel ? 'inline-flex w-full items-center gap-3 px-1 py-1.5' : 'inline-flex p-1'
          }
        >
          <span title={accountShortLabel}>
            <UserIcon className="size-6" />
          </span>
          {showLabel ? (
            <span aria-hidden="true" className="text-sm">
              {accountShortLabel}
            </span>
          ) : (
            <span className="sr-only">{accountShortLabel}</span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => void handleLogout()}
          aria-label={logoutLabel}
          title={logoutLabel}
          className={
            showLabel
              ? 'inline-flex w-full cursor-pointer items-center gap-3 px-1 py-1.5 text-header-foreground no-underline transition-colors duration-150 hover:text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              : 'inline-flex cursor-pointer rounded-sm p-1 text-header-foreground no-underline transition-colors duration-150 hover:text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          }
        >
          <LogoutIcon className="size-6" />
          {showLabel ? (
            <span aria-hidden="true" className="text-sm">
              {logoutLabel}
            </span>
          ) : null}
        </button>
      </span>
    );
  }

  return (
    <span
      className={
        showLabel
          ? 'flex w-full flex-col items-stretch gap-1'
          : 'inline-flex items-center gap-2 sm:gap-3'
      }
    >
      <Link
        href={`/${locale}/ingresar`}
        variant="header"
        ariaLabel={loginLabel}
        className={
          showLabel ? 'inline-flex w-full items-center gap-3 px-1 py-1.5' : 'inline-flex p-1'
        }
      >
        <span title={loginLabel}>
          <UserIcon className="size-6" />
        </span>
        {showLabel ? (
          <span aria-hidden="true" className="text-sm">
            {loginLabel}
          </span>
        ) : (
          <span className="sr-only">{loginLabel}</span>
        )}
      </Link>
      <Link
        href={`/${locale}/registro`}
        variant="header"
        ariaLabel={registerLabel}
        className={
          showLabel ? 'inline-flex w-full items-center gap-3 px-1 py-1.5' : 'inline-flex p-1'
        }
      >
        <span title={registerLabel}>
          <UserPlusIcon className="size-6" />
        </span>
        {showLabel ? (
          <span aria-hidden="true" className="text-sm">
            {registerLabel}
          </span>
        ) : (
          <span className="sr-only">{registerLabel}</span>
        )}
      </Link>
    </span>
  );
}
