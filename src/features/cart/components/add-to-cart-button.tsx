'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCart } from '@/features/cart/cart-context';

/**
 * Client add-to-cart button for product pages. Quantity is fixed to 1 per
 * click; the resulting cart (with server totals) is read back from the API.
 * Success plays a single volt pop (exponential ease-out, motion-safe);
 * the confirmation auto-clears so the CTA is ready for the next tap.
 */
export function AddToCartButton({
  productId,
  disabled,
  size = 'lg',
  label,
  addedLabel,
  errorLabel,
}: {
  productId: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label: string;
  addedLabel: string;
  errorLabel: string;
}) {
  const { status, addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [failed, setFailed] = useState(false);
  const pending = status === 'mutating';

  async function handleClick() {
    setFailed(false);
    setAdded(false);
    const result = await addItem(productId, 1);
    if (result.ok) {
      setAdded(true);
      window.setTimeout(() => {
        setAdded(false);
      }, 2200);
    } else {
      setFailed(true);
    }
  }

  return (
    <span className="flex flex-col gap-1.5">
      <Button
        size={size}
        disabled={disabled ?? pending}
        onClick={() => void handleClick()}
        className={added ? 'animate-cart-pop' : undefined}
        key={added ? 'added' : 'idle'}
      >
        {pending ? label : added ? addedLabel : label}
      </Button>
      {failed ? (
        <Text variant="small" className="text-destructive" role="alert">
          {errorLabel}
        </Text>
      ) : null}
    </span>
  );
}
