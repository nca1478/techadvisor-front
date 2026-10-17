'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { CloseIcon } from '@/components/ui/header-icons';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { AdminAdvisorSession } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

export interface ConversationSessionState {
  loading: boolean;
  data: AdminAdvisorSession | null;
  error: string | null;
}

/**
 * Minimized conversation viewer in a native `<dialog>` modal (same
 * focus-trapping pattern as `ConfirmDialog`, no new dependencies).
 * Only excerpts are ever rendered; full content never reaches this panel.
 */
export function ConversationDialog({
  open,
  session,
  onClose,
  messages,
}: {
  open: boolean;
  session: ConversationSessionState | null;
  onClose: () => void;
  messages: Dictionary;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const advisor = messages.admin.advisor;

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

  // Same behavior as the inventory adjust modal: background page locked
  // while open, backdrop click closes, X closes (no bottom button).
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
      aria-labelledby="conversation-dialog-title"
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-2xl overflow-hidden rounded-lg border border-border bg-surface text-foreground shadow-lg backdrop:bg-black/50"
    >
      <Button
        variant="ghost"
        size="sm"
        aria-label={advisor.close}
        title={advisor.close}
        onClick={onClose}
        className="absolute top-2 right-5 z-10 bg-surface"
      >
        <CloseIcon className="size-5" />
      </Button>
      <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:p-6">
        <Stack gap="sm" className="w-full min-w-0">
          <Heading level={2} className="pr-10">
            <span id="conversation-dialog-title">{advisor.conversationTitle}</span>
          </Heading>
          <Text tone="muted">{advisor.conversationNote}</Text>
          {session === null || session.loading ? (
            <Text tone="muted">{messages.common.loading}</Text>
          ) : session.error !== null ? (
            <Text role="alert" className="text-destructive">
              {session.error}
            </Text>
          ) : session.data === null || session.data.messages.length === 0 ? (
            <Text tone="muted">{advisor.conversationEmpty}</Text>
          ) : (
            <Stack gap="sm">
              {session.data.messages.map((message, index) => (
                <Text key={`${message.createdAt}-${String(index)}`}>
                  <strong>{message.role}:</strong> {message.excerpt}
                </Text>
              ))}
            </Stack>
          )}
        </Stack>
      </div>
    </dialog>
  );
}
