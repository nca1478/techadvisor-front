'use client';

import { Link } from '@/components/ui/link';
import { CartIcon } from '@/components/ui/header-icons';
import { useCart } from '@/features/cart/cart-context';

export interface CartNavLinkMessages {
  label: string;
  withCount: string;
}

/**
 * Header cart icon with a live item count badge (reference layout).
 * The count comes from the existing `CartProvider` — no extra fetching.
 * While loading or on error it renders the plain icon so the header never
 * shifts or breaks. Accessible name keeps the full text label.
 */
export function CartNavLink({
  locale,
  messages,
  showLabel = false,
}: {
  locale: string;
  messages: CartNavLinkMessages;
  /** Visible text label next to the icon (mobile menu rows); icon-only otherwise. */
  showLabel?: boolean;
}) {
  const { status, cart } = useCart();
  const known = status === 'ready' || status === 'mutating';
  const count = known ? (cart?.itemCount ?? 0) : null;
  const showCount = count !== null && count > 0;

  return (
    <Link
      href={`/${locale}/carrito`}
      variant="header"
      ariaLabel={showCount ? messages.withCount.replace('{count}', String(count)) : messages.label}
      className={
        showLabel
          ? 'inline-flex w-full items-center gap-3 px-1 py-1.5'
          : 'relative inline-flex items-center p-1'
      }
    >
      <span title={messages.label} className="relative">
        <CartIcon className="size-6" />
        {showCount ? (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[11px] font-bold leading-5 text-destructive-foreground"
          >
            {String(count)}
          </span>
        ) : null}
      </span>
      {showLabel ? (
        <span aria-hidden="true" className="text-sm">
          {messages.label}
        </span>
      ) : (
        <span className="sr-only">{messages.label}</span>
      )}
    </Link>
  );
}
