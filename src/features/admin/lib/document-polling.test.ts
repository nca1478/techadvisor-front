import { describe, expect, it, vi } from 'vitest';
import { pollDocumentsUntilSettled } from '@/features/admin/lib/document-polling';
import type { AdminDocument } from '@/lib/api/admin';

function makeDocument(id: string, status: AdminDocument['status']): AdminDocument {
  return {
    id,
    type: 'MANUAL',
    title: `Doc ${id}`,
    locale: 'en',
    productId: null,
    categoryId: null,
    sourceUrl: null,
    source: 'manual',
    status,
    error: null,
    fileName: null,
    mimeType: 'text/markdown',
    sizeBytes: 100,
    chunkCount: status === 'READY' ? 3 : 0,
    createdAt: '2026-10-08T12:00:00.000Z',
    updatedAt: '2026-10-08T12:00:00.000Z',
  };
}

describe('pollDocumentsUntilSettled', () => {
  it('streams updates and settles when every row is READY', async () => {
    const onUpdate = vi.fn();
    const states = new Map<string, AdminDocument['status'][]>([
      ['a', ['PROCESSING', 'READY']],
      ['b', ['READY']],
    ]);
    const result = await pollDocumentsUntilSettled(
      ['a', 'b'],
      (id) => {
        const queue = states.get(id) ?? ['READY'];
        return Promise.resolve(makeDocument(id, queue.shift() ?? 'READY'));
      },
      { onUpdate },
      { intervalMs: 1, maxAttempts: 5 },
    );
    expect(result.pending).toEqual([]);
    expect(result.attempts).toBe(2);
    expect(onUpdate).toHaveBeenCalledTimes(3);
  });

  it('stops after maxAttempts and reports the pending ids', async () => {
    const onUpdate = vi.fn();
    const result = await pollDocumentsUntilSettled(
      ['a'],
      (id) => Promise.resolve(makeDocument(id, 'PROCESSING')),
      { onUpdate },
      { intervalMs: 1, maxAttempts: 3 },
    );
    expect(result.pending).toEqual(['a']);
    expect(result.attempts).toBe(3);
    expect(onUpdate).toHaveBeenCalledTimes(3);
  });

  it('treats vanished rows as settled via onMissing', async () => {
    const onUpdate = vi.fn();
    const onMissing = vi.fn();
    const result = await pollDocumentsUntilSettled(
      ['gone'],
      () => Promise.resolve(null),
      { onUpdate, onMissing },
      { intervalMs: 1, maxAttempts: 3 },
    );
    expect(result.pending).toEqual([]);
    expect(onMissing).toHaveBeenCalledWith('gone');
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
