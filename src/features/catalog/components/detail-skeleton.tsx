import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import type { SkeletonMessage } from './home-skeleton';

/**
 * Detail loading shape (ADR 0017): back-link line + the same two-column
 * grid as the detail (gallery block + info block with spec rows).
 * Text-free bars keep it locale-independent; the region announces the
 * localized loading label.
 */
export function DetailSkeleton({ loadingLabel }: SkeletonMessage) {
  return (
    <Container>
      <div role="status" aria-busy="true" aria-label={loadingLabel}>
        <Section spacing="tight">
          <Stack gap="md" aria-hidden="true">
            <div className="h-5 w-32 rounded-sm bg-surface" />
            <Grid columns="two" gap="lg">
              <div className="aspect-4/3 w-full rounded-lg bg-surface" />
              <Stack gap="md">
                <div className="h-4 w-40 rounded-sm bg-surface" />
                <div className="h-10 w-3/4 rounded-md bg-surface" />
                <div className="h-6 w-48 rounded-sm bg-surface" />
                <div className="h-12 w-full rounded-md bg-surface" />
                <div className="h-4 w-full rounded-sm bg-surface" />
                <div className="h-4 w-5/6 rounded-sm bg-surface" />
                <div className="overflow-hidden rounded-md border border-border">
                  {[0, 1, 2].map((row) => (
                    <div
                      key={row}
                      className="grid grid-cols-2 gap-3 border-b border-border px-4 py-3 last:border-b-0 odd:bg-surface"
                    >
                      <div className="h-4 rounded-sm bg-border" />
                      <div className="h-4 rounded-sm bg-border" />
                    </div>
                  ))}
                </div>
              </Stack>
            </Grid>
          </Stack>
        </Section>
      </div>
    </Container>
  );
}
