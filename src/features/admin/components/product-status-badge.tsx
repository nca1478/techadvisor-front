import { Badge } from '@/components/ui/badge';
import type { Dictionary } from '@/lib/i18n/index';

/** Status-to-tone language shared by the badge and its action buttons. */
export const PRODUCT_STATUS_TONES = {
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
  const tone =
    (
      PRODUCT_STATUS_TONES as Record<
        string,
        (typeof PRODUCT_STATUS_TONES)[keyof typeof PRODUCT_STATUS_TONES]
      >
    )[status] ?? 'neutral';
  const label = (messages as Record<string, string>)[`status_${status}`] ?? status;
  return <Badge tone={tone}>{label}</Badge>;
}
