'use client';

import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { useCart } from '@/features/cart/cart-context';

export interface CartNavLinkMessages {
  label: string;
  withCount: string;
}

/**
 * Header cart link with a live item count (ADR 0014). The count comes from
 * the existing `CartProvider` — no extra fetching. While loading or on
 * error it renders the plain link so the header never shifts or breaks.
 */
export function CartNavLink({
  locale,
  messages,
}: {
  locale: string;
  messages: CartNavLinkMessages;
}) {
  const { status, cart } = useCart();
  const known = status === 'ready' || status === 'mutating';
  const count = known ? (cart?.itemCount ?? 0) : null;
  const showCount = count !== null && count > 0;

  return (
    <span className="inline-flex items-center gap-1.5">
      <Link
        href={`/${locale}/carrito`}
        variant="header"
        ariaLabel={
          showCount ? messages.withCount.replace('{count}', String(count)) : messages.label
        }
      >
        {messages.label}
      </Link>
      {showCount ? <Badge tone="primary">{String(count)}</Badge> : null}
    </span>
  );
}
