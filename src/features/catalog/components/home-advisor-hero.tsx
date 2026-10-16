import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

export interface HomeAdvisorHeroMessages {
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
}

export interface HomeAdvisorHeroProps {
  catalogHref: string;
  messages: HomeAdvisorHeroMessages;
  backgroundSrc?: string;
  backgroundAlt?: string;
}

const DEFAULT_BACKGROUND_SRC =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80';

/**
 * Home cover hero (ADR 0043 Signal Lab): full-bleed instrument panel over a
 * circuit photo. Left-aligned thesis composition — readout badge, display
 * headline, one volt CTA — with a telemetry strip (spec ticks) anchoring the
 * lab world. The photo is decorative plain `<img>` (no next/image remote
 * host needed, ADR 0011); layered ink gradients keep copy legible offline.
 */
export function HomeAdvisorHero({
  catalogHref,
  messages,
  backgroundSrc = DEFAULT_BACKGROUND_SRC,
  backgroundAlt = '',
}: HomeAdvisorHeroProps) {
  return (
    <div className="relative w-full overflow-hidden border-b border-border bg-header">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative cover: plain img avoids next/image remote-host config (ADR 0011), ink gradients keep it legible offline */}
      <img
        src={backgroundSrc}
        alt={backgroundAlt}
        aria-hidden={backgroundAlt === ''}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#0a0e13] via-[#0a0e13]/85 to-[#0a0e13]/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0e13] to-transparent"
      />

      <Container className="relative flex flex-col items-center py-20 text-center md:items-start md:py-32 md:text-left">
        <div className="animate-rise-in flex items-center justify-center gap-3 md:justify-start">
          <span
            aria-hidden="true"
            className="inline-block size-2 animate-pulse rounded-full bg-primary shadow-[0_0_12px_rgb(201_242_75/0.9)]"
          />
          <Badge tone="primary">{messages.badge}</Badge>
        </div>
        <Heading
          level={1}
          className="animate-rise-in mt-6 max-w-3xl text-center uppercase text-header-foreground [animation-delay:80ms] md:text-left"
        >
          {messages.title}
        </Heading>
        <Text
          variant="lead"
          tone="headerMuted"
          as="p"
          className="animate-rise-in mt-5 max-w-xl text-center [animation-delay:160ms] md:text-left"
        >
          {messages.subtitle}
        </Text>
        <div className="animate-rise-in mt-10 flex flex-wrap items-center justify-center gap-4 [animation-delay:240ms] md:justify-start">
          <Button href={catalogHref} size="lg">
            {messages.cta}
          </Button>
          <Text
            variant="caption"
            tone="headerMuted"
            as="span"
            className="font-mono uppercase tracking-[0.12em]"
          >
            1-tap add · cited answers
          </Text>
        </div>

        <div
          aria-hidden="true"
          className="mt-14 hidden w-full items-end justify-between gap-2 md:flex"
        >
          {Array.from({ length: 48 }).map((_, i) => (
            <span
              key={i}
              className="w-px bg-primary/25"
              style={{ height: `${String(8 + ((i * 37) % 28))}px` }}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
