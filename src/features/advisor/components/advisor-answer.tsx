'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import type { AdvisorCitation } from '@/lib/api/advisor';

export interface AdvisorAnswerProps {
  answer: string;
  citations: AdvisorCitation[];
  locale: string;
  sourceLabel: string;
  showSnippetLabel: string;
  hideSnippetLabel: string;
}

/**
 * Plain-text answer with clickable numbered citations. The LLM text is
 * NEVER rendered as HTML: it is split on `[n]` markers and each fragment
 * is rendered as text; only the structured `citations[]` become buttons.
 */
export function AdvisorAnswer({
  answer,
  citations,
  locale,
  sourceLabel,
  showSnippetLabel,
  hideSnippetLabel,
}: AdvisorAnswerProps) {
  const [openCitation, setOpenCitation] = useState<number | null>(null);
  // Defensive dedupe: the backend stores message-level citations as a flatMap
  // of per-product citations, so the same `[n]` (and chunkId) can arrive
  // repeated (e.g. two products citing [1]). Keep the first per `n` so React
  // keys stay unique and the list shows no duplicated rows.
  const uniqueCitations = [
    ...new Map(citations.map((citation) => [citation.n, citation])).values(),
  ];
  const byNumber = new Map(uniqueCitations.map((citation) => [citation.n, citation]));
  const parts = answer.split(/(\[\d+\])/g);

  return (
    <div>
      <p className="text-base leading-relaxed text-foreground">
        {parts.map((part, index) => {
          const match = part.match(/^\[(\d+)\]$/);
          if (!match) {
            return <span key={index}>{part}</span>;
          }
          const n = Number.parseInt(match[1], 10);
          const citation = byNumber.get(n);
          if (!citation) {
            // Marker without evidence: render as inert text, never a link.
            return <span key={index}>{part}</span>;
          }
          const expanded = openCitation === n;
          return (
            <button
              key={index}
              type="button"
              aria-expanded={expanded}
              aria-label={`${sourceLabel} ${String(n)}: ${citation.title}`}
              onClick={() => {
                setOpenCitation(expanded ? null : n);
              }}
              className="mx-0.5 inline-flex min-h-6 min-w-6 items-center justify-center rounded-md border border-accent/40 bg-accent/10 px-1.5 align-baseline font-mono text-xs font-semibold text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              [{String(n)}]
            </button>
          );
        })}
      </p>
      <ol className="mt-3 flex flex-col gap-2" aria-label={sourceLabel}>
        {uniqueCitations.map((citation) => {
          const expanded = openCitation === citation.n;
          return (
            <li key={citation.n} className="rounded-lg border border-border bg-surface px-3 py-2">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => {
                  setOpenCitation(expanded ? null : citation.n);
                }}
                className="flex w-full items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Badge tone="neutral">[{String(citation.n)}]</Badge>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {citation.title}
                </span>
                <span className="shrink-0 text-xs text-link">
                  {expanded ? hideSnippetLabel : showSnippetLabel}
                </span>
              </button>
              {expanded && (
                <Text variant="small" tone="muted" className="mt-1.5">
                  {citation.snippet}
                </Text>
              )}
            </li>
          );
        })}
      </ol>
      <span className="sr-only" lang={locale}>
        {answer}
      </span>
    </div>
  );
}
