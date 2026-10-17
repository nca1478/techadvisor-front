import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedSearch } from './use-debounced-search';

beforeEach(() => {
  vi.useRealTimers();
});

describe('useDebouncedSearch', () => {
  it('applies while typing once the pause elapses (no Enter needed)', () => {
    vi.useFakeTimers();
    const onApply = vi.fn();
    const { result } = renderHook(() => useDebouncedSearch('', onApply));

    act(() => {
      result.current.handleChange('pe');
    });
    act(() => {
      result.current.handleChange('pepe');
    });
    expect(onApply).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith('pepe');
  });

  it('applies immediately on Enter', () => {
    const onApply = vi.fn();
    const { result } = renderHook(() => useDebouncedSearch('', onApply));

    act(() => {
      result.current.handleChange('pepe');
    });
    act(() => {
      result.current.handleEnter();
    });
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith('pepe');
  });

  it('resets the draft without applying', () => {
    const onApply = vi.fn();
    const { result } = renderHook(() => useDebouncedSearch('abc', onApply));

    act(() => {
      result.current.reset();
    });
    expect(result.current.draft).toBe('');
    expect(onApply).not.toHaveBeenCalled();
  });
});
