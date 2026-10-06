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
}: {
  totalAmount: number;
  itemCount: number;
  currency: string;
  locale: string;
  checkoutHref: string;
  productsHref: string;
  messages: CartSummaryMessages;
}) {
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
        <Stack direction="horizontal" justify="between" align="center">
          <Text variant="lead" as="span">
            {messages.total}
          </Text>
          <Text variant="lead" as="span" role="status">
            {formatPrice(totalAmount, currency, locale)}
          </Text>
        </Stack>
        <Button size="lg" href={checkoutHref}>
          {messages.checkout}
        </Button>
        <Button variant="secondary" href={productsHref}>
          {messages.continueShopping}
        </Button>
      </Stack>
    </Card>
  );
}
