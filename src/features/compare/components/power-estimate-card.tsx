import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { PowerEstimate } from '../lib/power-estimate';

export interface PowerEstimateMessages {
  title: string;
  subtitle: string;
  estimatedDraw: string;
  requiredPsu: string;
  strongestPsu: string;
  noPsu: string;
  unknownTdp: string;
  sufficient: string;
  insufficient: string;
}

function formatWatts(value: number): string {
  return `${String(value)} W`;
}

/**
 * Presentational power panel for `/comparar`: per-product TDP plus the
 * deterministic draw/PSU estimate. Numbers come from `estimatePower`
 * (SQL specs); this component only renders them.
 */
export function PowerEstimateCard({
  estimate,
  messages,
}: {
  estimate: PowerEstimate;
  messages: PowerEstimateMessages;
}) {
  const verdictBadge =
    estimate.verdict === 'sufficient' ? (
      <Badge tone="success">{messages.sufficient}</Badge>
    ) : estimate.verdict === 'insufficient' ? (
      <Badge tone="destructive">{messages.insufficient}</Badge>
    ) : estimate.verdict === 'no-psu' ? (
      <Badge tone="warning">{messages.noPsu}</Badge>
    ) : (
      <Badge tone="warning">{messages.unknownTdp}</Badge>
    );

  return (
    <Card>
      <Stack gap="sm">
        <Stack gap="sm">
          <Heading level={2}>{messages.title}</Heading>
          <Text tone="muted">{messages.subtitle}</Text>
        </Stack>
        <ul className="flex flex-col gap-1">
          {estimate.contributors.map((entry) => (
            <li key={entry.productId} className="flex items-baseline justify-between gap-4">
              <Text as="span">{entry.name}</Text>
              <Text as="span" tone="muted">
                {formatWatts(entry.tdpW)}
              </Text>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-1">
          <li className="flex items-baseline justify-between gap-4">
            <Text as="span">{messages.estimatedDraw}</Text>
            <Text as="span" variant="small" tone="muted">
              {formatWatts(estimate.estimatedW)}
            </Text>
          </li>
          <li className="flex items-baseline justify-between gap-4">
            <Text as="span">{messages.requiredPsu}</Text>
            <Text as="span" variant="small" tone="muted">
              {formatWatts(estimate.requiredW)}
            </Text>
          </li>
          <li className="flex items-baseline justify-between gap-4">
            <Text as="span">{messages.strongestPsu}</Text>
            <Text as="span" variant="small" tone="muted">
              {estimate.strongestSupplyW === null
                ? messages.noPsu
                : formatWatts(estimate.strongestSupplyW)}
            </Text>
          </li>
        </ul>
        <div>{verdictBadge}</div>
      </Stack>
    </Card>
  );
}
