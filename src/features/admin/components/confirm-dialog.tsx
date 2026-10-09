'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { Dictionary } from '@/lib/i18n/index';

/**
 * Presentational confirmation dialog for destructive or irreversible
 * actions (archive, status change, stock adjust, image removal). Native
 * `<dialog>` keeps focus-trapping without new dependencies; `requireValue`
 * optionally asks to type a value (unused by default, kept minimal).
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  pending,
  onConfirm,
  onClose,
  messages,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  messages: Dictionary['admin'];
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      onClose();
    };
    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-dialog-title"
      className="rounded-lg border border-border bg-surface p-6 text-foreground backdrop:bg-black/50"
    >
      <Stack gap="md" className="w-full min-w-72 max-w-sm">
        <Heading level={2}>
          <span id="confirm-dialog-title">{title || messages.confirmTitle}</span>
        </Heading>
        {body ? <Text tone="muted">{body}</Text> : null}
        <Stack direction="horizontal" gap="md" justify="end">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            {cancelLabel ?? messages.cancel}
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={pending}>
            {confirmLabel ?? messages.confirmAction}
          </Button>
        </Stack>
      </Stack>
    </dialog>
  );
}
