import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
 * Home cover hero (ADR 0024): full-bleed dark cover over a niche photo
 * (circuit board), centered headline + supporting line + a single pill CTA
 * to the product listing. Full viewport width with square corners so it sits
 * flush under the navbar; the inner copy stays centered in a max width.
 * The photo is decorative and plain `<img>` (no next/image remote host
 * needed); the `bg-header` base and overlay keep the white copy legible
 * even if the photo fails to load.
 */
export function HomeAdvisorHero({
  catalogHref,
  messages,
  backgroundSrc = DEFAULT_BACKGROUND_SRC,
  backgroundAlt = '',
}: HomeAdvisorHeroProps) {
  return (
    <div className="relative w-full overflow-hidden bg-header">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative cover: plain img avoids next/image remote-host config (ADR 0011), bg-header keeps it legible offline */}
      <img
        src={backgroundSrc}
        alt={backgroundAlt}
        aria-hidden={backgroundAlt === ''}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-header/75" />

      <div className="relative flex flex-col items-center px-6 py-16 text-center md:px-12 md:py-24">
        <span>
          <Badge tone="primary">{messages.badge}</Badge>
        </span>
        <Heading level={1} className="mt-4 max-w-2xl text-header-foreground">
          {messages.title}
        </Heading>
        <Text variant="lead" tone="headerMuted" as="p" className="mt-4 max-w-xl">
          {messages.subtitle}
        </Text>
        <Button href={catalogHref} variant="secondary" size="lg" className="mt-8">
          {messages.cta}
        </Button>
      </div>
    </div>
  );
}
