'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { useSession } from '@/features/auth/session-context';
import { useCart } from '@/features/cart/cart-context';
import { EMPTY_SHIPPING, shippingSchema } from '../shipping-schema';
import { storeLastOrderId } from '../order-polling';
import {
  ShippingForm,
  type ShippingField,
  type ShippingFormMessages,
} from '../components/shipping-form';
import { OrderSummary } from '../components/order-summary';

export interface CheckoutPageMessages {
  title: string;
  subtitle: string;
  loginRequired: string;
  loginLink: string;
  emptyCart: string;
  browseProducts: string;
  shippingTitle: string;
  summaryTitle: string;
  itemsLabel: string;
  totalLabel: string;
  payWithStripe: string;
  stripeNote: string;
  form: ShippingFormMessages;
  genericError: string;
}

/**
 * Checkout container: address form + server cart summary, then order creation
 * and redirect to hosted Stripe Checkout. Totals are displayed from the
 * server cart; the order total is frozen by the backend from the database.
 */
export function CheckoutContainer({
  locale,
  messages,
}: {
  locale: string;
  messages: CheckoutPageMessages;
}) {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const { status: cartStatus, cart } = useCart();
  const [values, setValues] = useState<Record<ShippingField, string>>({ ...EMPTY_SHIPPING });
  const [errors, setErrors] = useState<Partial<Record<ShippingField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const loginHref = `/${locale}/ingresar?next=${encodeURIComponent(`/${locale}/checkout`)}`;

  useEffect(() => {
    if (sessionStatus === 'anonymous') {
      router.push(loginHref);
    }
  }, [sessionStatus, router, loginHref]);

  if (sessionStatus === 'loading' || cartStatus === 'loading') {
    return (
      <Container>
        <Section>
          <Text role="status">{messages.subtitle}</Text>
        </Section>
      </Container>
    );
  }

  if (sessionStatus === 'anonymous') {
    return (
      <Container>
        <Section>
          <Stack gap="md">
            <Text>{messages.loginRequired}</Text>
            <Link href={loginHref}>{messages.loginLink}</Link>
          </Stack>
        </Section>
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container>
        <Section>
          <Stack gap="md">
            <Heading level={1}>{messages.title}</Heading>
            <Text tone="muted">{messages.emptyCart}</Text>
            <Link href={`/${locale}/productos`}>{messages.browseProducts}</Link>
          </Stack>
        </Section>
      </Container>
    );
  }

  async function handlePay() {
    const parsed = shippingSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<ShippingField, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as ShippingField | undefined;
        if (!field || fieldErrors[field]) continue;
        fieldErrors[field] =
          issue.code === 'invalid_format' && field === 'country'
            ? messages.form.invalidCountry
            : messages.form.required;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setFormError(null);
    setPending(true);
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ shipping: parsed.data }),
      });
      const orderBody = (await orderRes.json().catch(() => null)) as {
        id?: unknown;
        message?: unknown;
      } | null;
      if (!orderRes.ok || !orderBody || typeof orderBody.id !== 'string') {
        const message =
          orderBody && typeof orderBody.message === 'string'
            ? orderBody.message
            : `${messages.genericError} (${String(orderRes.status)})`;
        setFormError(message);
        return;
      }
      const orderId = orderBody.id;
      storeLastOrderId(orderId);

      const checkoutRes = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ orderId }),
      });
      const checkoutBody = (await checkoutRes.json().catch(() => null)) as {
        checkoutUrl?: unknown;
        message?: unknown;
      } | null;
      const checkoutUrl =
        checkoutBody && typeof checkoutBody.checkoutUrl === 'string'
          ? checkoutBody.checkoutUrl
          : null;
      if (!checkoutRes.ok || !checkoutUrl) {
        const message =
          checkoutBody && typeof checkoutBody.message === 'string'
            ? checkoutBody.message
            : `${messages.genericError} (${String(checkoutRes.status)})`;
        setFormError(message);
        return;
      }
      window.location.assign(checkoutUrl);
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : messages.genericError);
    } finally {
      setPending(false);
    }
  }

  return (
    <Container>
      <Section>
        <Stack gap="md">
          <Stack gap="sm">
            <Heading level={1}>{messages.title}</Heading>
            <Text tone="muted">{messages.subtitle}</Text>
          </Stack>
          {formError ? (
            <Text className="text-destructive" role="alert">
              {formError}
            </Text>
          ) : null}
          <Grid columns="two" gap="lg">
            <Card>
              <Stack gap="md">
                <Text variant="lead" as="span">
                  {messages.shippingTitle}
                </Text>
                <ShippingForm
                  locale={locale}
                  values={values}
                  errors={errors}
                  messages={messages.form}
                  onChange={(field, value) => {
                    setValues((prev) => ({ ...prev, [field]: value }));
                  }}
                />
              </Stack>
            </Card>
            <Card>
              <Stack gap="md">
                <OrderSummary
                  items={cart.items.map((item) => ({
                    name: item.name,
                    qty: item.qty,
                    lineTotalAmount: item.lineTotalAmount,
                  }))}
                  totalAmount={cart.totalAmount}
                  itemCount={cart.itemCount}
                  currency={cart.currency}
                  locale={locale}
                  title={messages.summaryTitle}
                  itemsLabel={messages.itemsLabel}
                  totalLabel={messages.totalLabel}
                />
                <Button size="lg" loading={pending} onClick={() => void handlePay()}>
                  {messages.payWithStripe}
                </Button>
                <Text variant="caption" tone="muted">
                  {messages.stripeNote}
                </Text>
              </Stack>
            </Card>
          </Grid>
        </Stack>
      </Section>
    </Container>
  );
}
