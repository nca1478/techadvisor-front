import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  previousLabel: string;
  nextLabel: string;
  statusLabel: (page: number, totalPages: number) => string;
  /** Render with both buttons disabled on a single page (default: hidden). */
  alwaysVisible?: boolean;
}

/** Presentational pager: previous/next with page status (ARIA-aware). */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  previousLabel,
  nextLabel,
  statusLabel,
  alwaysVisible = false,
}: PaginationProps) {
  if (totalPages <= 1 && !alwaysVisible) return null;
  return (
    <nav aria-label="Pagination">
      <Stack direction="horizontal" gap="md" align="center" justify="center">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => {
            onPageChange(page - 1);
          }}
          aria-label={previousLabel}
        >
          {previousLabel}
        </Button>
        <Text variant="small" tone="muted" role="status">
          {statusLabel(page, totalPages)}
        </Text>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => {
            onPageChange(page + 1);
          }}
          aria-label={nextLabel}
        >
          {nextLabel}
        </Button>
      </Stack>
    </nav>
  );
}
