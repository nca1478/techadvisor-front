import { Badge } from '@/components/ui/badge';
import type { Dictionary } from '@/lib/i18n/index';

const TONES = {
  PENDING: 'neutral',
  PROCESSING: 'warning',
  READY: 'success',
  FAILED: 'destructive',
} as const;

/** Presentational document ingestion-status badge. */
export function DocumentStatusBadge({
  status,
  messages,
}: {
  status: string;
  messages: Dictionary['admin']['documents'];
}) {
  const tone = (TONES as Record<string, (typeof TONES)[keyof typeof TONES]>)[status] ?? 'neutral';
  const label = (messages as Record<string, string>)[`status_${status}`] ?? status;
  return <Badge tone={tone}>{label}</Badge>;
}
