import { Badge } from '@/components/ui/badge';
import type { Dictionary } from '@/lib/i18n/index';

const TONES = {
  DRAFT: 'neutral',
  ACTIVE: 'success',
  ARCHIVED: 'warning',
} as const;

/** Presentational product status badge. */
export function ProductStatusBadge({
  status,
  messages,
}: {
  status: string;
  messages: Dictionary['admin']['products'];
}) {
  const tone = (TONES as Record<string, (typeof TONES)[keyof typeof TONES]>)[status] ?? 'neutral';
  const label = (messages as Record<string, string>)[`status_${status}`] ?? status;
  return <Badge tone={tone}>{label}</Badge>;
}
