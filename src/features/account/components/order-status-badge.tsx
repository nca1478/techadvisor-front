import { Badge } from '@/components/ui/badge';
import type { Dictionary } from '@/lib/i18n/index';

const TONES = {
  PENDING_PAYMENT: 'warning',
  PAID: 'primary',
  PROCESSING: 'primary',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
} as const;

export type OrderStatusKey = keyof typeof TONES;

/** Presentational order status badge (customer + admin share it). */
export function OrderStatusBadge({
  status,
  messages,
}: {
  status: string;
  messages: Dictionary['account'];
}) {
  const tone = (TONES as Record<string, (typeof TONES)[OrderStatusKey]>)[status] ?? 'neutral';
  const label =
    (messages as Record<string, string>)[`status_${status}`] ?? status.replaceAll('_', ' ');
  return <Badge tone={tone}>{label}</Badge>;
}
