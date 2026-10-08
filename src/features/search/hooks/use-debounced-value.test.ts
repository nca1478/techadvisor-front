'use client';

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from './use-debounced-value';

describe('useDebouncedValue', () => {
  it('returns the value after the delay and skips intermediate ones', () => {
    vi.useFakeTimers();
    try {
      const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
        initialProps: { value: 'a' },
      });
      expect(result.current).toBe('a');

      rerender({ value: 'ab' });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current).toBe('a');

      rerender({ value: 'abc' });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current).toBe('abc');
    } finally {
      vi.useRealTimers();
    }
  });
});
