'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, use, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Text } from '@/components/ui/text';
import { readLastOrderId } from '@/features/checkout/order-polling';

/**
 * Stripe-facing cancel return (fixed by the backend `cancelUrl`, which
 * carries `?orderId=`). Forwards to the localized `/cancelado` page — see
 * ADR 0007.
 */
function CancelForwarder({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get('orderId') ?? readLastOrderId();
    const target = orderId
      ? `/${locale}/checkout/cancelado?orderId=${encodeURIComponent(orderId)}`
      : `/${locale}/checkout/cancelado`;
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

function CancelForwarderWithLocale({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return <CancelForwarder locale={locale} />;
}

export default function StripeCancelPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense>
      <CancelForwarderWithLocale params={params} />
    </Suspense>
  );
}
