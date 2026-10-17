import { useEffect, useRef, useState } from 'react';

/**
 * Draft text for admin server-side search filters. Same behavior as the
 * categories name filter (applies while typing, no Enter needed), adapted
 * to server-paginated lists: keystrokes are debounced into a single
 * `onApply` call, Enter applies immediately. Duplicate applies are
 * guarded when the timer races an Enter press or a clear action.
 */
export function useDebouncedSearch(
  initial: string,
  onApply: (trimmed: string) => void,
  delayMs = 400,
) {
  const [draft, setDraft] = useState(initial);
  const appliedRef = useRef(initial);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyRef = useRef(onApply);

  useEffect(() => {
    applyRef.current = onApply;
  });

  // Drop any pending search when the view unmounts.
  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    [],
  );

  function cancel() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function applyNow(value: string) {
    const trimmed = value.trim();
    if (trimmed === appliedRef.current) return;
    appliedRef.current = trimmed;
    applyRef.current(trimmed);
  }

  function handleChange(value: string) {
    setDraft(value);
    cancel();
    timerRef.current = setTimeout(() => {
      applyNow(value);
    }, delayMs);
  }

  function handleEnter() {
    cancel();
    applyNow(draft);
  }

  function reset() {
    cancel();
    appliedRef.current = '';
    setDraft('');
  }

  return { draft, handleChange, handleEnter, reset };
}
