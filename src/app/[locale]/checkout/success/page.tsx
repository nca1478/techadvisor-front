'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, use, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Text } from '@/components/ui/text';
import { readLastOrderId } from '@/features/checkout/order-polling';

/**
 * Stripe-facing success return (fixed by the backend `successUrl`, which only
 * carries `session_id`). Resolves the order id from `?orderId=` or from the
 * id stored before the redirect, then forwards to the localized `/exito`
 * page — see ADR 0007.
 */
function SuccessForwarder({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get('orderId') ?? readLastOrderId();
    const target = orderId
      ? `/${locale}/checkout/exito?orderId=${encodeURIComponent(orderId)}`
      : `/${locale}/checkout/exito`;
    router.replace(target);
  }, [router, searchParams, locale]);

  return (
    <Container>
      <Section>
        <Text role="status">…</Text>
      </Section>
    </Container>
  );
}

function SuccessForwarderWithLocale({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return <SuccessForwarder locale={locale} />;
}

export default function StripeSuccessPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense>
      <SuccessForwarderWithLocale params={params} />
    </Suspense>
  );
}
