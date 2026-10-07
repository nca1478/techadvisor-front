'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import { InventoryPanel } from '@/features/admin/components/inventory-panel';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import { inventoryAdjustFormSchema, parseDelta } from '@/features/admin/lib/admin-schemas';
import type { AdminInventory, AdminInventoryMovement } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

/**
 * Inventory container: adjust form with validation + confirmation (every
 * adjustment appends an audit row and cannot be undone), then refreshes
 * levels and history from the BFF.
 */
export function InventoryPanelContainer({
  productId,
  productName,
  initialInventory,
  initialMovements,
  locale,
  messages,
}: {
  productId: string;
  productName: string;
  initialInventory: AdminInventory | null;
  initialMovements: AdminInventoryMovement[];
  locale: string;
  messages: Dictionary;
}) {
  const inventoryMessages = messages.admin.inventory;
  const [inventory, setInventory] = useState(initialInventory);
  const [movements, setMovements] = useState(initialMovements);
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ delta?: string; reason?: string }>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function requestConfirm() {
    const parsed = inventoryAdjustFormSchema.safeParse({ delta, reason });
    const nextErrors: { delta?: string; reason?: string } = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === 'reason') nextErrors.reason = inventoryMessages.reason;
      }
    }
    if (parseDelta(delta) === null) nextErrors.delta = inventoryMessages.deltaInvalid;
    if (reason.trim() === '') nextErrors.reason = messages.admin.required;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    const amount = parseDelta(delta);
    if (amount === null) return;
    setPending(true);
    setServerError(null);
    setSavedMessage(null);
    try {
      const updated = await adminHttp.patch<AdminInventory>(
        `/inventory/${encodeURIComponent(productId)}`,
        { delta: amount, reason: reason.trim() },
      );
      setInventory(updated);
      const history = await adminHttp.get<AdminInventoryMovement[]>(
        `/inventory/${encodeURIComponent(productId)}/movements`,
      );
      setMovements(history);
      setDelta('');
      setReason('');
      setConfirmOpen(false);
      setSavedMessage(inventoryMessages.adjusted);
    } catch (error) {
      setServerError(adminErrorMessage(error, inventoryMessages.adjustError));
      setConfirmOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <InventoryPanel
        productName={productName}
        inventory={inventory}
        movements={movements}
        delta={delta}
        reason={reason}
        errors={errors}
        pending={pending}
        serverError={serverError}
        savedMessage={savedMessage}
        locale={locale}
        messages={inventoryMessages}
        onDeltaChange={setDelta}
        onReasonChange={setReason}
        onSubmit={requestConfirm}
      />
      <ConfirmDialog
        open={confirmOpen}
        title={messages.admin.confirmTitle}
        body={inventoryMessages.adjustConfirm.replace('{delta}', delta.trim())}
        pending={pending}
        messages={messages.admin}
        onConfirm={() => void handleConfirm()}
        onClose={() => {
          if (!pending) setConfirmOpen(false);
        }}
      />
    </>
  );
}
