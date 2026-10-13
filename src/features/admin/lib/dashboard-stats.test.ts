import { describe, expect, it } from 'vitest';
import {
  attentionTotal,
  formatBucketLabel,
  isMetricsOverview,
  parseDashboardRange,
  rangeBounds,
  rangeGranularity,
} from '@/features/admin/lib/dashboard-stats';

function overview(overrides: Record<string, unknown> = {}) {
  return {
    from: '2026-10-07T00:00:00.000Z',
    to: '2026-10-13T15:30:00.000Z',
    granularity: 'day',
    ordersTotal: 3,
    byStatus: [
      { status: 'CANCELLED', count: 1 },
      { status: 'PAID', count: 2 },
    ],
    revenue: [{ currency: 'USD', amount: 65_000, count: 2 }],
    bucketCurrency: 'USD',
    buckets: [{ key: '2026-10-07T00:00:00.000Z', amount: 65_000 }],
    attention: {
      outOfStock: 2,
      lowStock: 5,
      pendingReviews: 3,
      failedDocs: 1,
      openUnanswered: 4,
    },
    ...overrides,
  };
}

describe('dashboard range', () => {
  it('defaults unknown ranges to 7d and maps granularity', () => {
    expect(parseDashboardRange('7d')).toBe('7d');
    expect(parseDashboardRange('today')).toBe('today');
    expect(parseDashboardRange('30d')).toBe('30d');
    expect(parseDashboardRange('90d')).toBe('7d');
    expect(parseDashboardRange(undefined)).toBe('7d');
    expect(rangeGranularity('today')).toBe('hour');
    expect(rangeGranularity('7d')).toBe('day');
    expect(rangeGranularity('30d')).toBe('day');
  });

  it('builds UTC bounds with from before to', () => {
    const now = new Date('2026-10-13T15:30:00.000Z');
    const week = rangeBounds('7d', now);
    expect(week.from).toBe('2026-10-07T00:00:00.000Z');
    expect(week.to).toBe('2026-10-13T15:30:00.000Z');
    const today = rangeBounds('today', now);
    expect(today.from).toBe('2026-10-13T00:00:00.000Z');
  });
});

describe('isMetricsOverview', () => {
  it('accepts a well-formed overview payload', () => {
    expect(isMetricsOverview(overview())).toBe(true);
  });

  it('rejects malformed payloads', () => {
    expect(isMetricsOverview(null)).toBe(false);
    expect(isMetricsOverview({})).toBe(false);
    expect(isMetricsOverview(overview({ ordersTotal: '3' }))).toBe(false);
    expect(isMetricsOverview(overview({ revenue: [{ currency: 'USD' }] }))).toBe(false);
    expect(isMetricsOverview(overview({ buckets: [{ key: 7 }] }))).toBe(false);
    expect(isMetricsOverview(overview({ attention: { outOfStock: 1 } }))).toBe(false);
  });
});

describe('formatBucketLabel', () => {
  it('labels hours for today and days otherwise', () => {
    const hour = formatBucketLabel('2026-10-13T10:00:00.000Z', 'today', 'es');
    expect(hour.length).toBeGreaterThan(0);
    expect(formatBucketLabel('2026-10-13T00:00:00.000Z', '7d', 'es')).toContain('oct');
  });

  it('falls back to the raw key for invalid dates', () => {
    expect(formatBucketLabel('not-a-date', '7d', 'es')).toBe('not-a-date');
  });
});

describe('attentionTotal', () => {
  it('totals the queue without double-counting stock', () => {
    expect(
      attentionTotal({
        outOfStock: 2,
        lowStock: 5,
        pendingReviews: 3,
        failedDocs: 1,
        openUnanswered: 4,
      }),
    ).toEqual({ total: 13, partial: false });
  });

  it('flags partial data when a count is missing', () => {
    expect(
      attentionTotal({
        outOfStock: 0,
        lowStock: 0,
        pendingReviews: null,
        failedDocs: 1,
        openUnanswered: null,
      }),
    ).toEqual({ total: 1, partial: true });
  });
});
