import { describe, expect, it } from 'vitest';
import {
  adminNextStatuses,
  availableUnits,
  isAdminStockFilter,
  isLowStock,
  toAdminQuery,
} from '@/lib/api/admin';

describe('toAdminQuery', () => {
  it('builds an empty string for empty queries', () => {
    expect(toAdminQuery({})).toBe('');
  });

  it('skips empty values and stringifies the rest', () => {
    expect(toAdminQuery({ status: 'ACTIVE', q: '', page: 2, limit: 20 })).toBe(
      '?status=ACTIVE&page=2&limit=20',
    );
  });

  it('serializes the inventory stock filter with its threshold', () => {
    expect(toAdminQuery({ stock: 'low_stock', lowStockThreshold: 5, page: 1, limit: 10 })).toBe(
      '?stock=low_stock&lowStockThreshold=5&page=1&limit=10',
    );
  });
});

describe('isAdminStockFilter', () => {
  it('accepts only the three backend stock values', () => {
    expect(isAdminStockFilter('out_of_stock')).toBe(true);
    expect(isAdminStockFilter('low_stock')).toBe(true);
    expect(isAdminStockFilter('reserved')).toBe(true);
    expect(isAdminStockFilter('')).toBe(false);
    expect(isAdminStockFilter('foo')).toBe(false);
    expect(isAdminStockFilter(null)).toBe(false);
  });
});

describe('adminNextStatuses', () => {
  it('never offers PAID (webhook-only)', () => {
    for (const from of [
      'PENDING_PAYMENT',
      'PAID',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ]) {
      expect(adminNextStatuses(from)).not.toContain('PAID');
    }
  });

  it('follows the backend state machine minus the webhook edge', () => {
    expect(adminNextStatuses('PENDING_PAYMENT')).toEqual(['CANCELLED']);
    expect(adminNextStatuses('PAID')).toEqual(['PROCESSING', 'CANCELLED']);
    expect(adminNextStatuses('PROCESSING')).toEqual(['SHIPPED', 'CANCELLED']);
    expect(adminNextStatuses('SHIPPED')).toEqual(['DELIVERED']);
    expect(adminNextStatuses('DELIVERED')).toEqual([]);
    expect(adminNextStatuses('CANCELLED')).toEqual([]);
  });

  it('returns no transitions for unknown states', () => {
    expect(adminNextStatuses('NOPE')).toEqual([]);
  });
});

describe('low stock helpers', () => {
  it('computes available units as stock minus reserved', () => {
    expect(availableUnits({ stock: 10, reserved: 3 })).toBe(7);
  });

  it('flags products at or below the threshold', () => {
    expect(isLowStock({ stock: 7, reserved: 2 })).toBe(true);
    expect(isLowStock({ stock: 8, reserved: 2 })).toBe(false);
  });
});
