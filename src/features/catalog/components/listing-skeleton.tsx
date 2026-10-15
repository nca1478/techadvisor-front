import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { ProductGridSkeleton } from './product-card-grid';
import type { GridProps } from '@/components/ui/grid';
import type { SkeletonMessage } from './home-skeleton';

/**
 * Listing/search loading shape (ADR 0016): title lines + filter bar +
 * product grid with the same preset as the page (`featured` for
 * `/productos`, `products` for `/buscar`). Used as the `Suspense`
 * fallback of `/productos` and `/buscar`.
 */
export function ListingSkeleton({
  loadingLabel,
  columns = 'products',
}: SkeletonMessage & { columns?: GridProps['columns'] }) {
  return (
    <Container>
      <div role="status" aria-busy="true" aria-label={loadingLabel}>
        <Section spacing="tight">
          <Stack gap="md" aria-hidden="true">
            <Stack gap="sm">
              <div className="h-10 w-40 rounded-md bg-surface" />
              <div className="h-5 w-1/2 rounded-sm bg-surface" />
            </Stack>
            <div className="flex gap-4">
              <div className="h-10 flex-1 rounded-md bg-surface" />
              <div className="h-10 flex-1 rounded-md bg-surface" />
              <div className="hidden h-10 flex-1 rounded-md bg-surface sm:block" />
            </div>
            <ProductGridSkeleton loadingLabel={loadingLabel} columns={columns} />
          </Stack>
        </Section>
      </div>
    </Container>
  );
}
