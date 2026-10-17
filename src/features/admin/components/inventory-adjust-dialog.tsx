'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { CloseIcon } from '@/components/ui/header-icons';
import { Stack } from '@/components/ui/stack';

/**
 * Stock adjust viewer in a native `<dialog>` modal (same instant-open
 * pattern as `ConversationDialog` and `ConfirmDialog`, no dependencies
 * and no entrance animation). Closing notifies the container so it can
 * clear the selection (the URL is the source of truth).
 */
export function InventoryAdjustDialog({
  open,
  title,
  closeLabel,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
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
    dialog.addEventListener('close', onClose);
    return () => {
      dialog.removeEventListener('close', onClose);
    };
  }, [onClose]);

  // While the modal is open the background page stays put, so the wheel
  // never scrolls the table behind it and the modal actions keep focus.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="inventory-adjust-dialog-title"
      onClick={(event) => {
        // Backdrop clicks land on the <dialog> itself; anything inside
        // the panel bubbles from a descendant and must not close it.
        if (event.target === ref.current) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-2xl overflow-hidden rounded-lg border border-border bg-surface text-foreground shadow-lg backdrop:bg-black/50"
    >
      <Button
        variant="ghost"
        size="sm"
        aria-label={closeLabel}
        title={closeLabel}
        onClick={onClose}
        className="absolute top-2 right-5 z-10 bg-surface"
      >
        <CloseIcon className="size-5" />
      </Button>
      <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:p-6">
        <Stack gap="md" className="w-full min-w-0">
          <Heading level={2} className="pr-10">
            <span id="inventory-adjust-dialog-title">{title}</span>
          </Heading>
          {children}
        </Stack>
      </div>
    </dialog>
  );
}
