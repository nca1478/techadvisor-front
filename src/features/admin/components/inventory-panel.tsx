'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { AdminInventory, AdminInventoryMovement } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

/**
 * Presentational inventory panel: exact levels, adjust form and movement
 * history. Confirmation and persistence live in the container.
 */
export function InventoryPanel({
  productName,
  inventory,
  movements,
  delta,
  reason,
  errors,
  pending,
  serverError,
  savedMessage,
  locale,
  messages,
  onDeltaChange,
  onReasonChange,
  onSubmit,
}: {
  productName: string;
  inventory: AdminInventory | null;
  movements: AdminInventoryMovement[];
  delta: string;
  reason: string;
  errors: { delta?: string; reason?: string };
  pending: boolean;
  serverError: string | null;
  savedMessage: string | null;
  locale: string;
  messages: Dictionary['admin']['inventory'];
  onDeltaChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Stack gap="md">
      <Stack gap="sm">
        <Text variant="lead" as="div">
          {messages.title}
        </Text>
        {inventory ? (
          <Stack direction="horizontal" gap="md" wrap>
            <Text variant="small" tone="muted">
              {messages.tableStock}: {inventory.stock}
            </Text>
            <Text variant="small" tone="muted">
              {messages.tableReserved}: {inventory.reserved}
            </Text>
            <Text variant="small" tone="muted">
              {messages.tableAvailable}: {inventory.available}
            </Text>
          </Stack>
        ) : (
          <Text variant="small" tone="muted">
            {productName}
          </Text>
        )}
      </Stack>
      <Stack gap="sm">
        <Input
          label={messages.delta}
          name="delta"
          inputMode="numeric"
          value={delta}
          hint={messages.deltaHint}
          error={errors.delta}
          onChange={(event) => {
            onDeltaChange(event.target.value);
          }}
        />
        <Input
          label={messages.reason}
          name="reason"
          value={reason}
          hint={messages.reasonHint}
          error={errors.reason}
          onChange={(event) => {
            onReasonChange(event.target.value);
          }}
        />
        {serverError ? (
          <Text role="alert" className="text-destructive">
            {serverError}
          </Text>
        ) : null}
        {savedMessage ? <Text role="status">{savedMessage}</Text> : null}
        <div>
          <Button onClick={onSubmit} loading={pending}>
            {pending ? messages.applying : messages.apply}
          </Button>
        </div>
      </Stack>
      <Stack gap="sm">
        <Text variant="lead" as="div">
          {messages.movementsTitle}
        </Text>
        {movements.length === 0 ? (
          <Text variant="small" tone="muted">
            {messages.noMovements}
          </Text>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[36rem] border-collapse bg-surface text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                    {messages.tableDelta}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                    {messages.tableStockAfter}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                    {messages.tableReason}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                    {messages.tableDate}
                  </th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      {movement.delta > 0 ? `+${String(movement.delta)}` : String(movement.delta)}
                    </td>
                    <td className="px-4 py-3">{movement.stockAfter}</td>
                    <td className="px-4 py-3">{movement.reason}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(movement.createdAt, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Stack>
    </Stack>
  );
}
