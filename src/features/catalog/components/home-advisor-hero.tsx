import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';

export interface AdvisorPick {
  id: string;
  slug: string;
  name: string;
}

export interface HomeAdvisorHeroMessages {
  badge: string;
  title: string;
  question: string;
  answerIntro: string;
  citationLabel: string;
  disclaimer: string;
  trySearch: string;
  picksLabel: string;
  emptyPicks: string;
}

export interface HomeAdvisorHeroProps {
  locale: string;
  searchHref: string;
  picks: AdvisorPick[];
  detailHrefFor: (slug: string) => string;
  messages: HomeAdvisorHeroMessages;
}

/**
 * Presentational advisor preview for the home page (ADR 0013).
 * Static mock: the picks are real catalog products passed by the server
 * container, the answer copy is an illustrative sample (no fetching,
 * no streaming). Links point to existing routes only.
 */
export function HomeAdvisorHero({
  locale,
  searchHref,
  picks,
  detailHrefFor,
  messages,
}: HomeAdvisorHeroProps) {
  return (
    <Card variant="ghost">
      <Stack gap="md">
        <Stack gap="sm">
          <span>
            <Badge tone="primary">{messages.badge}</Badge>
          </span>
          <Heading level={2}>{messages.title}</Heading>
        </Stack>

        <Card>
          <Stack gap="sm">
            <Text variant="body" as="p">
              {messages.question}
            </Text>
            <Text variant="small" tone="muted" as="p">
              {messages.answerIntro}
            </Text>
            {picks.length === 0 ? (
              <Text variant="small" tone="muted" as="p" role="status">
                {messages.emptyPicks}
              </Text>
            ) : (
              <ol className="flex flex-col gap-3">
                {picks.map((pick, index) => (
                  <li key={pick.id} className="flex flex-col gap-1">
                    <Link href={detailHrefFor(pick.slug)}>{pick.name}</Link>
                    <Text variant="caption" tone="muted" as="p">
                      [{String(index + 1)}] {messages.citationLabel} · {locale}
                    </Text>
                  </li>
                ))}
              </ol>
            )}
            <Text variant="caption" tone="muted" as="p">
              {messages.disclaimer}
            </Text>
          </Stack>
        </Card>

        <Stack direction="horizontal" gap="md" wrap>
          <Button href={searchHref} variant="primary">
            {messages.trySearch}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
