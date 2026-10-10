'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { useCart } from '../cart-context';
import { CartLine, type CartLineMessages } from '../components/cart-line';
import { CartSummary, type CartSummaryMessages } from '../components/cart-summary';
import { CompatibilityAlert } from '../components/compatibility-alert';
import { useCompatibility } from '../hooks/use-compatibility';

export interface CartCompatibilityMessages {
  title: string;
  ok: string;
  errorBadge: string;
  warningBadge: string;
  viewProduct: string;
  acknowledge: string;
  checking: string;
}

export interface CartPageMessages {
  title: string;
  subtitle: string;
  loading: string;
  loadError: string;
  retry: string;
  empty: string;
  browseProducts: string;
  updateError: string;
  line: CartLineMessages;
  summary: CartSummaryMessages;
  compatibility: CartCompatibilityMessages;
}

/** Cart page container: list with qty controls + server-total summary. */
export function CartPageContainer({
  locale,
  messages,
}: {
  locale: string;
  messages: CartPageMessages;
}) {
  const { status, cart, error, reload, updateQty, removeItem } = useCart();
  const [actionError, setActionError] = useState<string | null>(null);

  const productIds = cart?.items.map((item) => item.productId) ?? [];
  const compatibility = useCompatibility(productIds, locale);

  // La confirmación explícita caduca si cambia el conjunto de avisos (sin
  // efectos: se deriva durante el render comparando la clave).
  const issueKey = compatibility.issues.map((issue) => issue.messageKey).join('|');
  const [ack, setAck] = useState({ key: issueKey, checked: false });
  const acknowledged = ack.key === issueKey && ack.checked;

  if (status === 'loading') {
    return (
      <Container>
        <Section>
          <Text role="status">{messages.loading}</Text>
        </Section>
      </Container>
    );
  }

  if (status === 'error' || !cart) {
    return (
      <Container>
        <Section>
          <Stack gap="md">
            <Heading level={1}>{messages.title}</Heading>
            <Text className="text-destructive" role="alert">
              {error ?? messages.loadError}
            </Text>
            <Link href={`/${locale}/carrito`}>{messages.retry}</Link>
          </Stack>
        </Section>
      </Container>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Container>
        <Section>
          <Stack gap="md">
            <Heading level={1}>{messages.title}</Heading>
            <Text tone="muted">{messages.empty}</Text>
            <Link href={`/${locale}/productos`}>{messages.browseProducts}</Link>
          </Stack>
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <Section>
        <Stack gap="md">
          <Stack gap="sm">
            <Heading level={1}>{messages.title}</Heading>
            <Text tone="muted">{messages.subtitle}</Text>
          </Stack>
          {actionError ? (
            <Text className="text-destructive" role="alert">
              {messages.updateError}: {actionError}
            </Text>
          ) : null}
          {compatibility.status === 'loading' ? (
            <Text tone="muted" role="status">
              {messages.compatibility.checking}
            </Text>
          ) : null}
          {compatibility.status === 'ready' && compatibility.issues.length > 0 ? (
            <CompatibilityAlert
              compatible={compatibility.compatible}
              issues={compatibility.issues}
              products={cart.items.map((item) => ({
                id: item.productId,
                slug: item.slug,
                name: item.name,
              }))}
              locale={locale}
              title={messages.compatibility.title}
              okLabel={messages.compatibility.ok}
              errorBadge={messages.compatibility.errorBadge}
              warningBadge={messages.compatibility.warningBadge}
              viewProductLabel={messages.compatibility.viewProduct}
            />
          ) : null}
          <Grid columns="two" gap="lg">
            <ul className="flex flex-col gap-3">
              {cart.items.map((item) => (
                <CartLine
                  key={item.productId}
                  item={item}
                  currency={cart.currency}
                  locale={locale}
                  pending={status === 'mutating'}
                  messages={messages.line}
                  onUpdateQty={(qty) => {
                    void updateQty(item.productId, qty).then((result) => {
                      setActionError(result.ok ? null : result.message);
                      if (!result.ok) void reload();
                    });
                  }}
                  onRemove={() => {
                    void removeItem(item.productId);
                  }}
                />
              ))}
            </ul>
            <CartSummary
              totalAmount={cart.totalAmount}
              itemCount={cart.itemCount}
              currency={cart.currency}
              locale={locale}
              checkoutHref={`/${locale}/checkout`}
              productsHref={`/${locale}/productos`}
              messages={{ ...messages.summary, acknowledge: messages.compatibility.acknowledge }}
              compatibilityGate={{
                required: compatibility.hasErrors,
                checked: acknowledged,
                onChange: (checked) => {
                  setAck({ key: issueKey, checked });
                },
              }}
            />
          </Grid>
        </Stack>
      </Section>
    </Container>
  );
}
