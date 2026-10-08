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

/** Presentational empty / error states (role-aware). */
export function CatalogEmpty({ title, message }: StateMessageProps) {
  return (
    <Card>
      <Stack gap="sm" align="center">
        <Heading level={3}>{title}</Heading>
        <Text tone="muted">{message}</Text>
      </Stack>
    </Card>
  );
}

export function CatalogError({ title, message, retryLabel, onRetry }: StateMessageProps) {
  return (
    <Card>
      <Stack gap="sm" align="center">
        <Heading level={3}>{title}</Heading>
        <Text tone="muted" role="alert">
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
