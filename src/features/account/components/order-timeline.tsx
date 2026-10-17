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
        className="flex flex-col items-center gap-0 sm:grid sm:grid-cols-2 sm:items-start sm:gap-x-4 sm:gap-y-6 lg:flex lg:flex-row lg:flex-nowrap lg:gap-0"
      >
        {ORDER_TIMELINE_FLOW.map((step, index) => {
          const isDone = !isCancelled && currentIndex !== -1 && index < currentIndex;
          const isCurrent = !isCancelled && index === currentIndex;
          const isLast = index === ORDER_TIMELINE_FLOW.length - 1;
          const reached = isDone || isCurrent;
          // Tablet (`sm`–`lg`) is a fixed 2-column grid, so the connectors
          // after the odd steps (Paid/Shipped, alone at each row end) would
          // dangle with nothing after them: hide them below `lg` (desktop
          // is a single row and keeps every connector).
          // Recorded date first; pre-history orders fall back to the
          // caller-provided date (creation for the first step, last
          // update for the current one) instead of inventing times.
          const reachedAt =
            statusReachedAt(history, step) ?? (reached ? (fallbackAt?.(step) ?? null) : null);
          const endsTabletRow = index % 2 === 1;
          return (
            <li
              key={step}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex w-full max-w-[15rem] min-w-0 items-stretch gap-3 sm:max-w-none sm:items-center sm:gap-2 lg:min-w-0 lg:flex-1 lg:gap-1.5"
            >
              <span className="flex shrink-0 flex-col items-center" aria-hidden="true">
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-lg font-mono text-xs font-semibold lg:size-6',
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
              <span
                className={cn(
                  'flex min-w-0 flex-col sm:pb-0',
                  // The last step needs no bottom gap on mobile so the space
                  // below it equals the card padding above the first dot.
                  isLast && !isCancelled ? 'pb-0' : 'pb-4',
                )}
              >
                <span
                  className={cn(
                    'pt-1 text-sm sm:pt-0 lg:text-[13px] lg:leading-tight',
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
                  <time
                    dateTime={reachedAt}
                    className="font-mono text-xs text-muted-foreground lg:text-[11px] lg:leading-snug"
                  >
                    {formatTimelineDate(reachedAt, locale)}
                  </time>
                ) : null}
              </span>
              {(!isLast || isCancelled) && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'mx-2 hidden h-px w-8 shrink-0 self-center lg:mx-1.5 lg:w-6 xl:mx-2 xl:w-8',
                    endsTabletRow ? 'lg:block' : 'sm:block',
                    isDone ? 'bg-primary/60' : 'bg-border-strong',
                  )}
                />
              )}
            </li>
          );
        })}
        {isCancelled && (
          <li className="flex w-full max-w-[15rem] min-w-0 items-stretch gap-3 sm:max-w-none sm:items-center sm:gap-2 lg:min-w-0 lg:flex-1 lg:gap-1.5">
            <span className="flex shrink-0 flex-col items-center" aria-hidden="true">
              <span className="flex size-7 items-center justify-center rounded-lg border border-destructive/30 bg-destructive-subtle font-mono text-xs font-semibold text-destructive lg:size-6">
                {'×'}
              </span>
            </span>
            <span className="flex min-w-0 flex-col">
              <span
                aria-current="step"
                className="pt-1 text-sm font-semibold text-destructive sm:pt-0 lg:text-[13px] lg:leading-tight"
              >
                {statusLabel('CANCELLED', messages)}
              </span>
              {cancelledAt !== null ? (
                <time
                  dateTime={cancelledAt}
                  className="font-mono text-xs text-muted-foreground lg:text-[11px] lg:leading-snug"
                >
                  {formatTimelineDate(cancelledAt, locale)}
                </time>
              ) : null}
            </span>
          </li>
        )}
      </ol>
    </div>
  );
}
