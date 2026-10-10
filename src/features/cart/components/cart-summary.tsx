import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { formatPrice } from '@/lib/money/format';

export interface CartSummaryMessages {
  title: string;
  items: string;
  total: string;
  checkout: string;
  continueShopping: string;
  acknowledge?: string;
}

export interface CompatibilityGate {
  /** True cuando hay errores de compatibilidad: exige confirmación explícita. */
  required: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * Order totals rendered exclusively from the server cart response
 * (`totalAmount` / `itemCount`). This component never sums line amounts.
 */
export function CartSummary({
  totalAmount,
  itemCount,
  currency,
  locale,
  checkoutHref,
  productsHref,
  messages,
  compatibilityGate,
}: {
  totalAmount: number;
  itemCount: number;
  currency: string;
  locale: string;
  checkoutHref: string;
  productsHref: string;
  messages: CartSummaryMessages;
  compatibilityGate?: CompatibilityGate;
}) {
  const blocked = compatibilityGate?.required === true && !compatibilityGate.checked;
  return (
    <Card>
      <Stack gap="md">
        <Text variant="lead" as="span">
          {messages.title}
        </Text>
        <Stack direction="horizontal" justify="between">
          <Text tone="muted">{messages.items.replace('{count}', String(itemCount))}</Text>
          <Text as="span">{formatPrice(totalAmount, currency, locale)}</Text>
        </Stack>
        <div className="border-t border-border" aria-hidden="true" />
        <Stack direction="horizontal" justify="between" align="center">
          <Text variant="lead" as="span">
            {messages.total}
          </Text>
          <Text variant="lead" as="span" role="status" className="font-bold">
            {formatPrice(totalAmount, currency, locale)}
          </Text>
        </Stack>
        {compatibilityGate?.required === true ? (
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={compatibilityGate.checked}
              onChange={(event) => {
                compatibilityGate.onChange(event.target.checked);
              }}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span>{messages.acknowledge ?? ''}</span>
          </label>
        ) : null}
        <Button size="lg" href={blocked ? undefined : checkoutHref} disabled={blocked}>
          {messages.checkout}
        </Button>
        <Button variant="secondary" href={productsHref}>
          {messages.continueShopping}
        </Button>
      </Stack>
    </Card>
  );
}
