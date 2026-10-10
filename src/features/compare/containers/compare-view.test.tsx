import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDictionarySync } from '@/lib/i18n/index';
import { CompareView } from './compare-view';

const dictionary = getDictionarySync('es');
const pageMessages = dictionary.compare.page;
const specLabels = dictionary.catalog.specLabels as unknown as Record<string, string>;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function comparePayload() {
  return {
    products: [
      {
        productId: 'a-id',
        name: 'Board A',
        slug: 'board-a',
        priceAmount: 10000,
        currency: 'USD',
        specs: { ram_gb: 16 },
      },
      {
        productId: 'b-id',
        name: 'Board B',
        slug: 'board-b',
        priceAmount: 8000,
        currency: 'USD',
        specs: { ram_gb: 32 },
      },
    ],
    table: [{ key: 'price_amount', values: [10000, 8000], best: [1], direction: 'lower' }],
    compatibility: { compatible: true, issues: [] },
    summary: 'B ofrece más RAM [1] por menos dinero.',
    citations: [
      { n: 1, documentId: 'd', chunkId: 'c', title: 'Board B manual', snippet: 'Treinta y dos.' },
    ],
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CompareView', () => {
  it('asks for two products when ?ids= is too short', () => {
    render(
      <CompareView
        idsParam="a-id"
        locale="es"
        productsHref="/es/productos"
        messages={pageMessages}
        specLabels={specLabels}
      />,
    );
    expect(screen.getByText(pageMessages.needTwo)).toBeVisible();
  });

  it('renders the SQL table plus the cited advisor summary', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse(200, comparePayload()))),
    );
    render(
      <CompareView
        idsParam="a-id,b-id"
        locale="es"
        productsHref="/es/productos"
        messages={pageMessages}
        specLabels={specLabels}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('B ofrece más RAM [1] por menos dinero.')).toBeVisible();
    });
    expect(screen.getByText('[1] Board B manual')).toBeVisible();
    expect(screen.getByText(pageMessages.table.best)).toBeVisible();
  });

  it('shows the deterministic compatibility verdict from the same payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          jsonResponse(200, {
            ...comparePayload(),
            compatibility: {
              compatible: false,
              issues: [
                {
                  rule: 'ram-type',
                  severity: 'error',
                  productIds: ['a-id'],
                  messageKey: 'ram-type.mismatch',
                  message: 'La memoria es DDR4 y la placa solo acepta DDR5.',
                },
              ],
            },
          }),
        ),
      ),
    );
    render(
      <CompareView
        idsParam="a-id,b-id"
        locale="es"
        productsHref="/es/productos"
        messages={pageMessages}
        specLabels={specLabels}
      />,
    );
    await screen.findByText('La memoria es DDR4 y la placa solo acepta DDR5.');
    expect(screen.getByText(pageMessages.compatibilityErrorBadge)).toBeVisible();
  });
});
