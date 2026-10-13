/**
 * Pure dashboard helpers. Since ADR 0043/0037 the KPIs come exact from
 * `GET /admin/metrics/overview`; this module keeps range parsing, bucket
 * labels, the overview response guard and the attention-queue total.
 */

export const DASHBOARD_RECENT_COUNT = 5;

export const DASHBOARD_RANGES = ['today', '7d', '30d'] as const;
export type DashboardRange = (typeof DASHBOARD_RANGES)[number];
export const DEFAULT_DASHBOARD_RANGE: DashboardRange = 'today';

/** Unknown/missing range falls back to the default (documented in ADR 0036). */
export function parseDashboardRange(value: unknown): DashboardRange {
  return DASHBOARD_RANGES.includes(value as DashboardRange)
    ? (value as DashboardRange)
    : DEFAULT_DASHBOARD_RANGE;
}

/** Backend `granularity` matching the range (`today` buckets by UTC hour). */
export function rangeGranularity(range: DashboardRange): 'hour' | 'day' {
  return range === 'today' ? 'hour' : 'day';
}

/** UTC range bounds for the overview `from`/`to` filters. */
export function rangeBounds(range: DashboardRange, now: Date): { from: string; to: string } {
  const to = now.toISOString();
  if (range === 'today') {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    return { from: from.toISOString(), to };
  }
  const days = range === '7d' ? 7 : 30;
  const startDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1)),
  );
  return { from: startDay.toISOString(), to };
}

export interface OverviewRevenue {
  currency: string;
  amount: number;
  count: number;
}

export interface OverviewBucket {
  key: string;
  amount: number;
}

export interface OverviewAttention {
  outOfStock: number;
  lowStock: number;
  pendingReviews: number;
  failedDocs: number;
  openUnanswered: number;
}

/** Structural mirror of the backend `AdminMetricsOverviewDto` (see ADR 0043). */
export interface MetricsOverview {
  from: string | null;
  to: string | null;
  granularity: string;
  ordersTotal: number;
  byStatus: { status: string; count: number }[];
  revenue: OverviewRevenue[];
  bucketCurrency: string | null;
  buckets: OverviewBucket[];
  attention: OverviewAttention;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isCountPair(value: unknown): value is { status: string; count: number } {
  return (
    isRecord(value) && typeof value['status'] === 'string' && typeof value['count'] === 'number'
  );
}

function isRevenue(value: unknown): value is OverviewRevenue {
  return (
    isRecord(value) &&
    typeof value['currency'] === 'string' &&
    typeof value['amount'] === 'number' &&
    typeof value['count'] === 'number'
  );
}

function isBucket(value: unknown): value is OverviewBucket {
  return isRecord(value) && typeof value['key'] === 'string' && typeof value['amount'] === 'number';
}

function isAttention(value: unknown): value is OverviewAttention {
  if (!isRecord(value)) return false;
  const keys = ['outOfStock', 'lowStock', 'pendingReviews', 'failedDocs', 'openUnanswered'];
  return keys.every((key) => typeof value[key] === 'number');
}

/** Runtime guard for the overview payload (backendFetch returns unknown). */
export function isMetricsOverview(value: unknown): value is MetricsOverview {
  if (!isRecord(value)) return false;
  return (
    (typeof value['from'] === 'string' || value['from'] === null) &&
    (typeof value['to'] === 'string' || value['to'] === null) &&
    typeof value['granularity'] === 'string' &&
    typeof value['ordersTotal'] === 'number' &&
    Array.isArray(value['byStatus']) &&
    (value['byStatus'] as unknown[]).every(isCountPair) &&
    Array.isArray(value['revenue']) &&
    (value['revenue'] as unknown[]).every(isRevenue) &&
    (typeof value['bucketCurrency'] === 'string' || value['bucketCurrency'] === null) &&
    Array.isArray(value['buckets']) &&
    (value['buckets'] as unknown[]).every(isBucket) &&
    isAttention(value['attention'])
  );
}

export interface SalesBucket {
  key: string;
  label: string;
  amount: number;
}

/** Localized UTC label for an overview bucket key (hour for `today`, day otherwise). */
export function formatBucketLabel(key: string, range: DashboardRange, locale: string): string {
  const date = new Date(key);
  if (Number.isNaN(date.getTime())) return key;
  if (range === 'today') {
    return new Intl.DateTimeFormat(locale, { hour: 'numeric', timeZone: 'UTC' }).format(date);
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date);
}

/** Actionable-queue total; null inputs (failed fetches) count as 0 but flag partial data. */
export function attentionTotal(parts: {
  outOfStock: number;
  lowStock: number;
  pendingReviews: number | null;
  failedDocs: number | null;
  openUnanswered: number | null;
}): { total: number; partial: boolean } {
  // justificado: lowStock incluye outOfStock; la cola cuenta sin-stock aparte
  // y el resto de poco stock para no duplicar.
  const restLow = Math.max(0, parts.lowStock - parts.outOfStock);
  const total =
    parts.outOfStock +
    restLow +
    (parts.pendingReviews ?? 0) +
    (parts.failedDocs ?? 0) +
    (parts.openUnanswered ?? 0);
  const partial =
    parts.pendingReviews === null || parts.failedDocs === null || parts.openUnanswered === null;
  return { total, partial };
}
