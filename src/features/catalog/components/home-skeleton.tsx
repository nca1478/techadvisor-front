import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { ProductGridSkeleton } from './product-card-grid';

export interface SkeletonMessage {
  loadingLabel: string;
}

/**
 * Home loading shape (ADR 0016): title lines + advisor hero block +
 * featured grid with the same `products` preset. Text-free bars keep it
 * locale-independent; the region announces the localized loading label.
 */
export function HomeSkeleton({ loadingLabel }: SkeletonMessage) {
  return (
    <Container>
      <div role="status" aria-busy="true" aria-label={loadingLabel}>
        <Section spacing="tight">
          <Stack gap="sm" aria-hidden="true">
            <div className="h-10 w-48 rounded-md bg-surface" />
            <div className="h-5 w-2/3 rounded-sm bg-surface" />
          </Stack>
        </Section>

        <Section spacing="tight">
          <Stack gap="md" aria-hidden="true">
            <div className="skeleton h-4 w-32 rounded-sm" />
            <div className="skeleton h-8 w-3/4 rounded-md" />
            <div className="rounded-xl border border-border p-6">
              <Stack gap="sm">
                <div className="skeleton h-5 w-2/3 rounded-sm" />
                <div className="skeleton h-4 w-1/2 rounded-sm" />
                <div className="skeleton h-4 w-1/3 rounded-sm" />
              </Stack>
            </div>
          </Stack>
        </Section>

        <Section spacing="tight">
          <Stack gap="md" aria-hidden="true">
            <div className="h-8 w-56 rounded-md bg-surface" />
            <ProductGridSkeleton count={4} loadingLabel={loadingLabel} />
          </Stack>
        </Section>
      </div>
    </Container>
  );
}
