import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { MediaFrame } from '@/components/ui/media-frame';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';

export interface HomeAdvisorBandMessages {
  badge: string;
  title: string;
  question: string;
  answerIntro: string;
  citationLabel: string;
  disclaimer: string;
  cta: string;
}

const ADVISOR_IMAGE_SRC =
  'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1200&auto=format&fit=crop';

export interface HomeAdvisorBandProps {
  locale: string;
  advisorHref: string;
  messages: HomeAdvisorBandMessages;
}

/**
 * Advisor proof band (cyan wash): photo left, cited sample Q&A right.
 * Cyan is evidence-only here (badge + citation markers); the CTA stays
 * secondary so volt keeps owning conversion. Decorative photo only.
 */
export function HomeAdvisorBand({ advisorHref, messages }: HomeAdvisorBandProps) {
  return (
    <div className="border-y border-accent/25 bg-accent/[0.07]">
      <Container>
        <Section spacing="tight">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <MediaFrame
              src={ADVISOR_IMAGE_SRC}
              alt=""
              ratio="standard"
              rounded="lg"
              className="shadow-md"
            />
            <Stack gap="md">
              <Heading level={2}>{messages.title}</Heading>
              <div className="rounded-xl border border-border bg-surface p-6 shadow-md">
                <Text variant="body" as="p" className="font-medium">
                  {messages.question}
                </Text>
                <Text variant="caption" tone="muted" as="p" className="mt-4">
                  {messages.answerIntro}
                </Text>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[1, 2].map((n) => (
                    <span
                      key={n}
                      className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-md border border-accent/40 bg-accent/10 px-1.5 font-mono text-xs font-semibold text-accent"
                    >
                      {messages.citationLabel} [{n}]
                    </span>
                  ))}
                </div>
                <Text variant="caption" tone="muted" as="p" className="mt-4">
                  {messages.disclaimer}
                </Text>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button href={advisorHref} variant="secondary" size="lg">
                  {messages.cta}
                </Button>
                <Text variant="caption" tone="muted" as="span">
                  {messages.badge}
                </Text>
              </div>
            </Stack>
          </div>
        </Section>
      </Container>
    </div>
  );
}
