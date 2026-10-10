import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export interface CompareBarMessages {
  status: string;
  view: string;
  clear: string;
}

/**
 * Barra de comparación: cuenta `n/3` y enlace a `/comparar`. Solo se
 * muestra cuando hay al menos un producto seleccionado.
 */
export function CompareBar({
  count,
  max,
  href,
  messages,
  onClear,
}: {
  count: number;
  max: number;
  href: string | null;
  messages: CompareBarMessages;
  onClear: () => void;
}) {
  if (count === 0) return null;
  return (
    <div
      role="status"
      className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface px-4 py-2"
    >
      <Text variant="small">
        {messages.status.replace('{count}', String(count)).replace('{max}', String(max))}
      </Text>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onClear}>
          {messages.clear}
        </Button>
        {href ? (
          <Button size="sm" href={href}>
            {messages.view}
          </Button>
        ) : (
          <Button size="sm" disabled>
            {messages.view}
          </Button>
        )}
      </div>
    </div>
  );
}
