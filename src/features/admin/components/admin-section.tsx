import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';

/**
 * Consistent admin module header: title + subtitle inside a white
 * (surface) card, with an optional actions slot on the right
 * (e.g. "New product"). All list modules share this layout.
 */
export function AdminHeaderCard({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <Card>
      <Stack direction="horizontal" gap="md" align="center" justify="between" wrap>
        <Stack gap="sm">
          <Heading level={2}>{title}</Heading>
          <Text tone="muted">{subtitle}</Text>
        </Stack>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </Stack>
    </Card>
  );
}

/**
 * Consistent admin filters container: every module wraps its filter
 * controls in a white (surface) card with the same horizontal layout.
 */
export function AdminFiltersCard({ children }: { children: ReactNode }) {
  return (
    <Card>
      <Stack direction="horizontal" gap="md" align="end" wrap>
        {children}
      </Stack>
    </Card>
  );
}
