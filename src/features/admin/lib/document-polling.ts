import type { AdminDocument } from '@/lib/api/admin';
import { isDocumentProcessing } from '@/lib/api/admin';

export interface DocumentPollOptions {
  intervalMs?: number;
  maxAttempts?: number;
  isSettled?: (document: AdminDocument) => boolean;
}

export interface DocumentPollResult {
  /** Ids still transient when the budget ran out (caller shows a note). */
  pending: string[];
  attempts: number;
}

/**
 * Polls one detail fetch per transient document until every row settles
 * (READY/FAILED) or the attempt budget runs out — the same bounded shape
 * as the checkout `pollOrderUntilSettled`. `fetchOne` returns `null` for
 * rows that vanished mid-poll (e.g. deleted elsewhere): they count as
 * settled and are reported via `onMissing` so the caller can drop them.
 */
export async function pollDocumentsUntilSettled(
  ids: string[],
  fetchOne: (id: string) => Promise<AdminDocument | null>,
  callbacks: {
    onUpdate: (document: AdminDocument) => void;
    onMissing?: (id: string) => void;
  },
  options: DocumentPollOptions = {},
): Promise<DocumentPollResult> {
  const { intervalMs = 2000, maxAttempts = 15, isSettled = defaultIsSettled } = options;
  let attempts = 0;
  let pending = [...ids];
  while (pending.length > 0 && attempts < maxAttempts) {
    if (attempts > 0) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    attempts += 1;
    const stillPending: string[] = [];
    for (const id of pending) {
      const document = await fetchOne(id);
      if (document === null) {
        callbacks.onMissing?.(id);
        continue;
      }
      callbacks.onUpdate(document);
      if (!isSettled(document)) {
        stillPending.push(id);
      }
    }
    pending = stillPending;
  }
  return { pending, attempts };
}

function defaultIsSettled(document: AdminDocument): boolean {
  return !isDocumentProcessing(document.status);
}
