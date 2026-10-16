import { cn } from '@/components/ui/cn';
import type { Dictionary } from '@/lib/i18n/index';

type AccountMessages = Dictionary['account'];

/**
 * Lineal order flow verified against the backend state machine
 * (`backend/src/modules/orders/order-status.ts`, ADR 0011):
 * PENDING_PAYMENT → PAID → PROCESSING → SHIPPED → DELIVERED, with
 * CANCELLED as an exceptional terminal branch (reachable from
 * PENDING_PAYMENT, PAID and PROCESSING).
 * // mantener en sync con backend (`modules/orders/order-status.ts`).
 */
export const ORDER_TIMELINE_FLOW = [
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
] as const;

export type OrderTimelineStatus = (typeof ORDER_TIMELINE_FLOW)[number] | 'CANCELLED';

/** One recorded status change as served by the API (`statusHistory`, oldest first). */
export interface OrderStatusHistoryEntry {
  from: string | null;
  to: string;
  /** ISO 8601 UTC date/time when the order entered `to`. */
  at: string;
}

function statusLabel(status: string, messages: AccountMessages): string {
  return (messages as Record<string, string>)[`status_${status}`] ?? status.replaceAll('_', ' ');
}

/** Latest recorded entry into `status`, or null when unrecorded. */
export function statusReachedAt(
  history: OrderStatusHistoryEntry[] | undefined,
  status: string,
): string | null {
  if (history === undefined) return null;
  let reached: string | null = null;
  for (const entry of history) {
    if (entry.to === status) reached = entry.at;
  }
  return reached;
}

/** Date/time of the most recent recorded status change, or null. */
export function lastStatusChangeAt(history: OrderStatusHistoryEntry[] | undefined): string | null {
  if (history === undefined || history.length === 0) return null;
  return history[history.length - 1].at;
}

/** Formats an ISO date/time like the order headers (medium date, short time). */
export function formatTimelineDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

/**
 * Presentational order timeline (customer + admin share it).
 * Pure render over the current `status`: steps before it read as done,
 * the matching step carries `aria-current="step"`, later steps as pending.
 * `CANCELLED` renders the linear flow muted plus a terminal destructive
 * node, because without per-state history the cancellation origin is
 * unknown. Labels reuse `account.status_*`; no fetch inside.
 * Each reached step shows its recorded date/time when `history` knows it
 * (pre-history orders fall back to `createdAt`/`updatedAt` via `fallbackAt`).
 */
export function OrderTimeline({
  status,
  messages,
  locale,
  history,
  fallbackAt,
}: {
  status: string;
  messages: AccountMessages;
  locale: string;
  history?: OrderStatusHistoryEntry[];
  /** Fallback ISO date/time per step (e.g. order `createdAt`/`updatedAt`). */
  fallbackAt?: (step: string) => string | null;
}) {
  const label = messages.timelineLabel;
  const isCancelled = status === 'CANCELLED';
  const currentIndex = (ORDER_TIMELINE_FLOW as readonly string[]).indexOf(status);
  const cancelledAt =
    statusReachedAt(history, 'CANCELLED') ??
    (isCancelled ? (fallbackAt?.('CANCELLED') ?? null) : null);

  return (
    <div>
      <ol
        aria-label={label}
        className="flex flex-col gap-0 sm:flex-row sm:flex-wrap sm:items-start"
      >
        {ORDER_TIMELINE_FLOW.map((step, index) => {
          const isDone = !isCancelled && currentIndex !== -1 && index < currentIndex;
          const isCurrent = !isCancelled && index === currentIndex;
          const isLast = index === ORDER_TIMELINE_FLOW.length - 1;
          const reached = isDone || isCurrent;
          // Recorded date first; pre-history orders fall back to the
          // caller-provided date (creation for the first step, last
          // update for the current one) instead of inventing times.
          const reachedAt =
            statusReachedAt(history, step) ?? (reached ? (fallbackAt?.(step) ?? null) : null);
          return (
            <li
              key={step}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex items-stretch gap-3 sm:items-center sm:gap-2"
            >
              <span className="flex flex-col items-center" aria-hidden="true">
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-lg font-mono text-xs font-semibold',
                    isCancelled
                      ? 'border border-border bg-surface text-muted-foreground'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground shadow-[0_0_16px_rgb(201_242_75/0.45)]'
                        : isDone
                          ? 'border border-primary/50 bg-primary-subtle text-primary'
                          : 'border border-border bg-surface text-muted-foreground',
                  )}
                >
                  {isDone ? '✓' : String(index + 1)}
                </span>
                {!isLast || isCancelled ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'block h-6 w-px sm:hidden',
                      isDone ? 'bg-primary/60' : 'bg-border-strong',
                    )}
                  />
                ) : null}
              </span>
              <span className="flex flex-col pb-4 sm:pb-0">
                <span
                  className={cn(
                    'pt-1 text-sm sm:pt-0',
                    isCancelled
                      ? 'text-muted-foreground'
                      : isCurrent
                        ? 'font-semibold text-foreground'
                        : isDone
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                  )}
                >
                  {statusLabel(step, messages)}
                </span>
                {reachedAt !== null ? (
                  <time dateTime={reachedAt} className="font-mono text-xs text-muted-foreground">
                    {formatTimelineDate(reachedAt, locale)}
                  </time>
                ) : null}
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'mx-2 hidden h-px w-8 self-center sm:block',
                    isDone ? 'bg-primary/60' : 'bg-border-strong',
                  )}
                />
              )}
            </li>
          );
        })}
        {isCancelled && (
          <li className="flex items-stretch gap-3 sm:items-center sm:gap-2">
            {/* Separator from the "Entregado" step: without it the X node
                sticks to the previous label and the row breaks. Mirrors the
                step connectors (same tokens, horizontal on sm+, the mobile
                vertical link comes from the step above). */}
            <span
              aria-hidden="true"
              className="mx-2 hidden h-px w-8 self-center bg-border-strong sm:block"
            />
            <span className="flex flex-col items-center" aria-hidden="true">
              <span className="flex size-7 items-center justify-center rounded-lg border border-destructive/30 bg-destructive-subtle font-mono text-xs font-semibold text-destructive">
                {'×'}
              </span>
            </span>
            <span className="flex flex-col">
              <span
                aria-current="step"
                className="pt-1 text-sm font-semibold text-destructive sm:pt-0"
              >
                {statusLabel('CANCELLED', messages)}
              </span>
              {cancelledAt !== null ? (
                <time dateTime={cancelledAt} className="font-mono text-xs text-muted-foreground">
                  {formatTimelineDate(cancelledAt, locale)}
                </time>
              ) : null}
            </span>
          </li>
        )}
      </ol>
      {isCancelled ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {messages.timelineCancelledNote}
        </p>
      ) : null}
    </div>
  );
}
