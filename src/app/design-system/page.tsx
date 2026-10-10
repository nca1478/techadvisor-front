import { notFound } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Heading,
  Input,
  Link,
  MediaFrame,
  Section,
  Stack,
  Text,
} from '@/components/ui';

export const metadata = {
  title: 'Design System — TechAdvisor',
  robots: { index: false, follow: false },
};

/**
 * Visual review page for tokens and primitives (ADR 0005).
 * Only available outside production. Neutral sample copy, no business views.
 */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <main>
      <Container>
        <Section spacing="tight">
          <Stack gap="md">
            <Badge tone="primary">Tokens · review only</Badge>
            <Heading level={1}>Design system sample</Heading>
            <Text variant="lead" tone="muted">
              Neutral sample copy showing type scale, palette, spacing, buttons, links, badges,
              cards, inputs, grids and media frames.
            </Text>
          </Stack>
        </Section>

        <Section spacing="tight">
          <Stack gap="md">
            <Heading level={2}>Typography</Heading>
            <Heading level={1}>Heading one sample</Heading>
            <Heading level={2}>Heading two sample</Heading>
            <Heading level={3}>Heading three sample</Heading>
            <Heading level={4}>Heading four sample</Heading>
            <Text variant="lead">Lead paragraph sample for introductions.</Text>
            <Text variant="body">
              Body paragraph sample for product descriptions and general copy.
            </Text>
            <Text variant="small">Small text sample for metadata and hints.</Text>
            <Text variant="caption" tone="muted">
              Caption sample for timestamps and footnotes.
            </Text>
            <Text tone="muted">Muted tone sample for secondary information.</Text>
          </Stack>
        </Section>

        <Section spacing="tight">
          <Stack gap="md">
            <Heading level={2}>Palette</Heading>
            <Text tone="muted">Semantic tokens. Text pairs verified at WCAG AA or higher.</Text>
            <Grid columns="three" gap="md">
              <PaletteSwatch
                swatch="bg-background border border-border"
                name="background / foreground"
                detail="Page base · ratio 15.09"
              />
              <PaletteSwatch
                swatch="bg-surface border border-border"
                name="surface"
                detail="Cards and banners"
              />
              <PaletteSwatch
                swatch="bg-foreground"
                name="foreground on background"
                detail="Primary text · ratio 15.09"
                textClass="text-background"
              />
              <PaletteSwatch
                swatch="bg-primary"
                name="primary"
                detail="CTA yellow · dark text ratio 13.61"
                textClass="text-primary-foreground"
              />
              <PaletteSwatch
                swatch="bg-link"
                name="link"
                detail="Links · ratio 5.67"
                textClass="text-background"
              />
              <PaletteSwatch
                swatch="bg-header"
                name="header"
                detail="Header navy · white text ratio 17.67"
                textClass="text-header-foreground"
              />
              <PaletteSwatch
                swatch="bg-accent"
                name="accent"
                detail="Highlights · white text ratio 5.47"
                textClass="text-accent-foreground"
              />
              <PaletteSwatch
                swatch="bg-success"
                name="success"
                detail="Available · white text ratio 5.02"
                textClass="text-success-foreground"
              />
              <PaletteSwatch
                swatch="bg-warning"
                name="warning"
                detail="Notice · white text ratio 5.02"
                textClass="text-warning-foreground"
              />
              <PaletteSwatch
                swatch="bg-destructive"
                name="destructive"
                detail="Error and deals · white text ratio 5.71"
                textClass="text-destructive-foreground"
              />
              <PaletteSwatch
                swatch="bg-muted-foreground"
                name="muted-foreground"
                detail="Secondary text · ratio 5.63"
                textClass="text-background"
              />
            </Grid>
          </Stack>
        </Section>

        <Section spacing="tight">
          <Stack gap="md">
            <Heading level={2}>Spacing</Heading>
            <Text tone="muted">Base unit steps used for gaps and padding.</Text>
            <Stack gap="sm">
              <SpacingRow label="gap-3" bar="h-3 w-24 bg-primary rounded-sm" />
              <SpacingRow label="gap-4" bar="h-4 w-24 bg-primary rounded-sm" />
              <SpacingRow label="gap-6" bar="h-6 w-24 bg-primary rounded-sm" />
              <SpacingRow label="p-4" bar="h-8 w-24 bg-accent rounded-sm" />
              <SpacingRow label="p-6" bar="h-12 w-24 bg-accent rounded-sm" />
            </Stack>
          </Stack>
        </Section>

        <Section spacing="tight">
          <Stack gap="md">
            <Heading level={2}>Buttons and links</Heading>
            <Stack direction="horizontal" gap="md" wrap align="center">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link button</Button>
            </Stack>
            <Stack direction="horizontal" gap="md" wrap align="center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </Stack>
            <Stack direction="horizontal" gap="md" wrap align="center">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button href="#buttons">Anchor button</Button>
            </Stack>
            <Stack direction="horizontal" gap="md" wrap>
              <Link href="#buttons">Default link sample</Link>
              <Link href="#buttons" variant="muted">
                Muted link sample
              </Link>
              <Link href="https://example.com">External link sample</Link>
            </Stack>
          </Stack>
        </Section>

        <Section spacing="tight">
          <Stack gap="md">
            <Heading level={2}>Badges and cards</Heading>
            <Stack direction="horizontal" gap="md" wrap>
              <Badge tone="neutral">Neutral</Badge>
              <Badge tone="primary">Primary</Badge>
              <Badge tone="success">Success</Badge>
              <Badge tone="warning">Warning</Badge>
              <Badge tone="destructive">Destructive</Badge>
            </Stack>
            <Grid columns="three" gap="md">
              <Card>
                <Stack gap="sm">
                  <Heading level={4}>Default card</Heading>
                  <Text variant="small" tone="muted">
                    Border with soft shadow for product tiles.
                  </Text>
                </Stack>
              </Card>
              <Card variant="outline">
                <Stack gap="sm">
                  <Heading level={4}>Outline card</Heading>
                  <Text variant="small" tone="muted">
                    Border without shadow for grouped content.
                  </Text>
                </Stack>
              </Card>
              <Card variant="ghost">
                <Stack gap="sm">
                  <Heading level={4}>Ghost card</Heading>
                  <Text variant="small" tone="muted">
                    Tinted surface for banners and callouts.
                  </Text>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Section>

        <Section spacing="tight">
          <Stack gap="md">
            <Heading level={2}>Inputs</Heading>
            <Grid columns="two" gap="md">
              <Input label="Sample label" name="sample" placeholder="Placeholder copy" />
              <Input
                label="With hint"
                name="with-hint"
                placeholder="Placeholder copy"
                hint="Helper copy for the field."
              />
              <Input
                label="With error"
                name="with-error"
                placeholder="Placeholder copy"
                error="Error copy linked to the field."
              />
              <Input label="Disabled" name="disabled" placeholder="Placeholder copy" disabled />
            </Grid>
          </Stack>
        </Section>

        <Section spacing="tight">
          <Stack gap="md">
            <Heading level={2}>Product grid and media</Heading>
            <Text tone="muted">Two columns on mobile, three on tablet, four on desktop.</Text>
            <Grid columns="products" gap="md">
              {['one', 'two', 'three', 'four'].map((item) => (
                <Card key={item} padding="none">
                  <MediaFrame
                    src="/design-system-placeholder.svg"
                    alt={`Neutral placeholder image ${item}`}
                    rounded="sm"
                  />
                  <Stack gap="sm" className="p-4">
                    <Text variant="small">Sample product name</Text>
                    <Text variant="small" tone="muted">
                      Sample price row
                    </Text>
                    <Button size="sm">Sample action</Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
            <Grid columns="three" gap="md">
              <MediaFrame
                src="/design-system-placeholder.svg"
                alt="Neutral placeholder in square ratio"
                ratio="square"
              />
              <MediaFrame
                src="/design-system-placeholder.svg"
                alt="Neutral placeholder in video ratio"
                ratio="video"
              />
              <MediaFrame
                src="/design-system-placeholder.svg"
                alt="Neutral placeholder in standard ratio"
                ratio="standard"
              />
            </Grid>
          </Stack>
        </Section>
      </Container>
    </main>
  );
}

function PaletteSwatch({
  swatch,
  name,
  detail,
  textClass = 'text-foreground',
}: {
  swatch: string;
  name: string;
  detail: string;
  textClass?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 rounded-lg p-4 ${swatch}`}>
      <span className={`text-sm font-medium ${textClass}`}>{name}</span>
      <span className={`text-xs ${textClass}`}>{detail}</span>
    </div>
  );
}

function SpacingRow({ label, bar }: { label: string; bar: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-16 text-sm text-muted-foreground">{label}</span>
      <span className={bar} aria-hidden="true" />
    </div>
  );
}
