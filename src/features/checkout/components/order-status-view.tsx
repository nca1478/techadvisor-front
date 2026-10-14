'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { Order } from '@/lib/api/orders';
import { pollOrderUntilSettled } from '../order-polling';
import { CheckoutSteps } from './checkout-steps';
import { OrderSummary, orderSummaryProps } from '../components/order-summary';

export interface OrderStatusMessages {
  loading: string;
  processingTitle: string;
  processingBody: string;
  paidTitle: string;
  paidBody: string;
  cancelledTitle: string;
  cancelledBody: string;
  unknownTitle: string;
  unknownBody: string;
  stillProcessing: string;
  payAgain: string;
  backHome: string;
  viewProducts: string;
  summaryTitle: string;
  itemsLabel: string;
  totalLabel: string;
  orderLabel: string;
  stepAddress: string;
  stepPayment: string;
  stepDone: string;
}

type Phase =
  | { kind: 'loading' }
  | { kind: 'processing'; order: Order }
  | { kind: 'settled'; order: Order }
  | { kind: 'unknown' };

/**
 * Order status view with bounded polling. The order renders as soon as the
 * first fetch returns (a `PENDING_PAYMENT` order shows the "processing
 * payment" state with its summary while polling continues); the Stripe
 * webhook (never the redirect) is what moves it to `PAID`. When polling is
 * exhausted the order is shown with a "pay again" action that reuses the
 * backend idempotency key (`checkout-{orderId}`).
 */
export function OrderStatusView({
  orderId,
  locale,
  messages,
}: {
  orderId: string | null;
  locale: string;
  messages: OrderStatusMessages;
}) {
  const [phase, setPhase] = useState<Phase>(() =>
    orderId ? { kind: 'loading' } : { kind: 'unknown' },
  );
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!orderId) {
      return () => {
        cancelled = true;
      };
    }
    void pollOrderUntilSettled(
      () =>
        fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          credentials: 'same-origin',
        }).then(async (res): Promise<Order> => {
          if (!res.ok) {
            throw new Error(`Request failed with status ${String(res.status)}`);
          }
          return (await res.json()) as Order;
        }),
      {
        intervalMs: 2500,
        maxAttempts: 24,
        // Render the order as soon as the first fetch returns instead of
        // holding "Loading order..." for the whole poll: a PENDING_PAYMENT
        // order shows the processing state (summary + spinner) while the
        // webhook confirmation arrives in the background.
        onOrder: (order) => {
          if (cancelled) return;
          setPhase(
            order.status === 'PENDING_PAYMENT'
              ? { kind: 'processing', order }
              : { kind: 'settled', order },
          );
        },
      },
    )
      .then(({ order }) => {
        if (cancelled) return;
        setPhase(
          order.status === 'PENDING_PAYMENT'
            ? { kind: 'processing', order }
            : { kind: 'settled', order },
        );
      })
      .catch(() => {
        if (!cancelled) setPhase({ kind: 'unknown' });
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function handlePayAgain(order: Order) {
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ orderId: order.id }),
      });
      const body = (await res.json().catch(() => null)) as {
        checkoutUrl?: unknown;
      } | null;
      const checkoutUrl = body && typeof body.checkoutUrl === 'string' ? body.checkoutUrl : null;
      if (!res.ok || !checkoutUrl) {
        setPayError(`Request failed with status ${String(res.status)}`);
        return;
      }
      window.location.assign(checkoutUrl);
    } catch (error: unknown) {
      setPayError(error instanceof Error ? error.message : 'Network request failed');
    } finally {
      setPaying(false);
    }
  }

  if (phase.kind === 'loading') {
    return (
      <Container>
        <Section>
          <Text role="status">{messages.loading}</Text>
        </Section>
      </Container>
    );
  }

  if (phase.kind === 'unknown' || !orderId) {
    return (
      <Container>
        <Section>
          <Stack gap="md" className="mx-auto w-full max-w-md">
            <Heading level={1}>{messages.unknownTitle}</Heading>
            <Text tone="muted">{messages.unknownBody}</Text>
            <Link href={`/${locale}`}>{messages.backHome}</Link>
          </Stack>
        </Section>
      </Container>
    );
  }

  const { order } = phase;
  const summary = orderSummaryProps(order);
  const title =
    phase.kind === 'processing'
      ? messages.processingTitle
      : order.status === 'CANCELLED'
        ? messages.cancelledTitle
        : messages.paidTitle;
  const body =
    phase.kind === 'processing'
      ? messages.processingBody
      : order.status === 'CANCELLED'
        ? messages.cancelledBody
        : messages.paidBody;

  return (
    <Container>
      <Section>
        <Stack gap="md" className="mx-auto w-full max-w-xl">
          <Stack gap="sm">
            <Heading level={1}>{title}</Heading>
            <Text tone="muted">{messages.orderLabel.replace('{id}', order.id)}</Text>
            <Text tone={phase.kind === 'processing' ? undefined : 'muted'} role="status">
              {body}
            </Text>
          </Stack>
          <CheckoutSteps
            label={title}
            current={3}
            messages={{
              address: messages.stepAddress,
              payment: messages.stepPayment,
              done: messages.stepDone,
            }}
          />
          {phase.kind === 'processing' && (
            <Stack gap="sm">
              <span
                aria-hidden="true"
                className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
              <Text variant="small" tone="muted">
                {messages.stillProcessing}
              </Text>
            </Stack>
          )}
          <Card>
            <OrderSummary
              items={summary.items}
              totalAmount={summary.totalAmount}
              itemCount={summary.itemCount}
              currency={summary.currency}
              locale={locale}
              title={messages.summaryTitle}
              itemsLabel={messages.itemsLabel}
              totalLabel={messages.totalLabel}
            />
          </Card>
          {payError ? (
            <Text className="text-destructive" role="alert">
              {payError}
            </Text>
          ) : null}
          <Stack direction="horizontal" gap="md">
            {order.status === 'PENDING_PAYMENT' && (
              <Button loading={paying} onClick={() => void handlePayAgain(order)}>
                {messages.payAgain}
              </Button>
            )}
            <Link href={`/${locale}/productos`}>{messages.viewProducts}</Link>
          </Stack>
        </Stack>
      </Section>
    </Container>
  );
}
