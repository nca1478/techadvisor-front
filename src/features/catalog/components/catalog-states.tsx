import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';

export interface StateMessageProps {
  title: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

/**
 * Drawn signal glyph for empty states: concentric lab reticle.
 * Authored SVG (no emoji, no icon-font dependency).
 */
function EmptyReticle() {
  return (
    <svg
      aria-hidden="true"
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      className="text-border-strong"
    >
      <circle cx="36" cy="36" r="30" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="36" cy="36" r="18" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="36" cy="36" r="4" fill="#c9f24b" />
      <path d="M36 2v10M36 60v10M2 36h10M60 36h10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Presentational empty / error states (role-aware). */
export function CatalogEmpty({ title, message }: StateMessageProps) {
  return (
    <Card className="border-dashed">
      <Stack gap="md" align="center" className="px-6 py-12 text-center">
        <EmptyReticle />
        <Heading level={3}>{title}</Heading>
        <Text tone="muted" className="max-w-md">
          {message}
        </Text>
      </Stack>
    </Card>
  );
}

export function CatalogError({ title, message, retryLabel, onRetry }: StateMessageProps) {
  return (
    <Card className="border-destructive/40">
      <Stack gap="md" align="center" className="px-6 py-12 text-center">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-full bg-destructive-subtle font-mono text-xl text-destructive"
        >
          !
        </span>
        <Heading level={3}>{title}</Heading>
        <Text tone="muted" role="alert" className="max-w-md">
          {message}
        </Text>
        {retryLabel && onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
      </Stack>
    </Card>
  );
}
