'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { CompareCitation } from '@/lib/api/compare';

export interface CompareSummaryMessages {
  title: string;
  disclaimer: string;
  sources: string;
  showSnippet: string;
  hideSnippet: string;
}

/**
 * Resumen del asesor sobre la tabla: texto con marcadores `[n]` y citas
 * visibles. Presentacional; el fetch vive en el contenedor.
 */
export function CompareSummary({
  summary,
  citations,
  messages,
}: {
  summary: string;
  citations: CompareCitation[];
  messages: CompareSummaryMessages;
}) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Card>
      <Stack gap="sm">
        <Text variant="lead" as="span">
          {messages.title}
        </Text>
        <Text>{summary}</Text>
        <Text variant="caption" tone="muted">
          {messages.disclaimer}
        </Text>
        {citations.length > 0 ? (
          <Stack gap="sm">
            <Text variant="small" as="span" className="font-medium">
              {messages.sources}
            </Text>
            <ol className="flex flex-col gap-2">
              {citations.map((citation) => (
                <li key={citation.chunkId} className="text-sm">
                  <Text as="span" variant="small">
                    [{citation.n}] {citation.title}
                  </Text>{' '}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setOpen(open === citation.n ? null : citation.n);
                    }}
                    aria-expanded={open === citation.n}
                  >
                    {open === citation.n ? messages.hideSnippet : messages.showSnippet}
                  </Button>
                  {open === citation.n ? (
                    <Text variant="small" tone="muted">
                      {citation.snippet}
                    </Text>
                  ) : null}
                </li>
              ))}
            </ol>
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
}
