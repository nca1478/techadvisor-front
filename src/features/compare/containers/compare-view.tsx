'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { parseCompareIds, parseCompareResponse, type CompareResponse } from '@/lib/api/compare';
import { CompatibilityAlert } from '@/features/cart/components/compatibility-alert';
import type { CompatibilityIssue } from '@/lib/api/compatibility';
import { sortCompatibilityIssues } from '@/lib/api/compatibility';
import { estimatePower } from '../lib/power-estimate';
import { PowerEstimateCard, type PowerEstimateMessages } from '../components/power-estimate-card';
import { CompareTable, type CompareTableMessages } from '../components/compare-table';
import { CompareSummary, type CompareSummaryMessages } from '../components/compare-summary';

export interface CompareViewMessages {
  title: string;
  subtitle: string;
  loading: string;
  loadError: string;
  retry: string;
  needTwo: string;
  browseProducts: string;
  useCaseLabel: string;
  useCasePlaceholder: string;
  compareAction: string;
  table: CompareTableMessages;
  summary: CompareSummaryMessages;
  compatibilityTitle: string;
  compatibilityOk: string;
  compatibilityErrorBadge: string;
  compatibilityWarningBadge: string;
  power: PowerEstimateMessages;
  viewProduct: string;
}

function errorMessage(status: number, body: unknown): string {
  if (body !== null && typeof body === 'object') {
    const message = (body as Record<string, unknown>)['message'];
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return `Request failed with status ${String(status)}`;
}

/**
 * Contenedor de `/comparar`: lee `?ids=` de la URL, pide
 * `POST /api/advisor/compare` y muestra la tabla SQL, el veredicto
 * determinista de compatibilidad y el resumen del asesor con citas.
 */
export function CompareView({
  idsParam,
  locale,
  productsHref,
  messages,
  specLabels,
  // Temporalmente oculto (se usará más adelante): el fetch sigue trayendo
  // `summary` + `citations` para no cambiar el contrato con el backend.
  showAdvisorSummary = false,
}: {
  idsParam: string;
  locale: string;
  productsHref: string;
  messages: CompareViewMessages;
  specLabels: Record<string, string>;
  showAdvisorSummary?: boolean;
}) {
  const ids = parseCompareIds(idsParam);
  const [useCase, setUseCase] = useState('');
  const [requestedUseCase, setRequestedUseCase] = useState<string | undefined>(undefined);
  const [runId, setRunId] = useState(0);

  const requestKey = `${idsParam}|${locale}|${requestedUseCase ?? ''}|${String(runId)}`;
  const [entry, setEntry] = useState<{
    key: string;
    status: 'ready' | 'error';
    data: CompareResponse | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (ids.length < 2) return;
    let cancelled = false;
    fetch('/api/advisor/compare', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        productIds: ids,
        ...(requestedUseCase ? { useCase: requestedUseCase } : {}),
        locale,
      }),
    })
      .then(async (res) => {
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) throw new Error(errorMessage(res.status, body));
        return parseCompareResponse(body);
      })
      .then((parsed) => {
        if (cancelled) return;
        setEntry({ key: requestKey, status: 'ready', data: parsed, error: null });
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setEntry({
          key: requestKey,
          status: 'error',
          data: null,
          error: fetchError instanceof Error ? fetchError.message : messages.loadError,
        });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `requestKey` resume la petición.
  }, [requestKey]);

  if (ids.length < 2) {
    return (
      <Container>
        <Section>
          <Stack gap="md">
            <Heading level={1}>{messages.title}</Heading>
            <Card className="border-dashed">
              <Stack gap="md" align="center" className="px-6 py-12 text-center">
                <Text tone="muted" className="max-w-md">
                  {messages.needTwo}
                </Text>
                <Button href={productsHref}>{messages.browseProducts}</Button>
              </Stack>
            </Card>
          </Stack>
        </Section>
      </Container>
    );
  }

  const current = entry !== null && entry.key === requestKey ? entry : null;
  const status = current?.status ?? 'loading';
  const data = current?.data ?? null;
  const error = current?.error ?? null;

  const issues: CompatibilityIssue[] =
    data !== null ? sortCompatibilityIssues(data.compatibility.issues) : [];
  const powerEstimate = data !== null ? estimatePower(data.products) : null;

  return (
    <Container>
      <Section>
        <Stack gap="md">
          <Stack gap="sm">
            <Heading level={1}>{messages.title}</Heading>
            <Text tone="muted">{messages.subtitle}</Text>
          </Stack>

          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setRequestedUseCase(useCase.trim() === '' ? undefined : useCase.trim());
            }}
          >
            <label
              className="flex min-w-52 flex-1 flex-col gap-1 text-sm"
              htmlFor="compare-usecase"
            >
              {messages.useCaseLabel}
              <input
                id="compare-usecase"
                type="text"
                value={useCase}
                maxLength={500}
                placeholder={messages.useCasePlaceholder}
                onChange={(event) => {
                  setUseCase(event.target.value);
                }}
                className="h-10 rounded-lg border border-border-strong bg-surface px-3 transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-muted-foreground focus:border-primary"
              />
            </label>
            <Button type="submit">{messages.compareAction}</Button>
          </form>

          {status === 'loading' ? <Text role="status">{messages.loading}</Text> : null}
          {status === 'error' ? (
            <Stack gap="sm">
              <Text role="alert" className="text-destructive">
                {error ?? messages.loadError}
              </Text>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRunId((value) => value + 1);
                }}
              >
                {messages.retry}
              </Button>
            </Stack>
          ) : null}

          {status === 'ready' && data !== null ? (
            <Stack gap="md">
              <CompareTable
                products={data.products}
                table={data.table}
                locale={locale}
                specLabels={specLabels}
                messages={messages.table}
              />
              {powerEstimate !== null ? (
                <PowerEstimateCard estimate={powerEstimate} messages={messages.power} />
              ) : null}
              <CompatibilityAlert
                compatible={data.compatibility.compatible}
                issues={issues}
                products={data.products.map((product) => ({
                  id: product.productId,
                  slug: product.slug,
                  name: product.name,
                }))}
                locale={locale}
                title={messages.compatibilityTitle}
                okLabel={messages.compatibilityOk}
                errorBadge={messages.compatibilityErrorBadge}
                warningBadge={messages.compatibilityWarningBadge}
                viewProductLabel={messages.viewProduct}
              />
              {showAdvisorSummary ? (
                <CompareSummary
                  summary={data.summary}
                  citations={data.citations}
                  messages={messages.summary}
                />
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </Section>
    </Container>
  );
}
