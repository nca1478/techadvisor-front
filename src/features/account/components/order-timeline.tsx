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

function statusLabel(status: string, messages: AccountMessages): string {
  return (messages as Record<string, string>)[`status_${status}`] ?? status.replaceAll('_', ' ');
}

/**
 * Presentational order timeline (customer + admin share it).
 * Pure render over the current `status`: steps before it read as done,
 * the matching step carries `aria-current="step"`, later steps as pending.
 * `CANCELLED` renders the linear flow muted plus a terminal destructive
 * node, because without per-state history the cancellation origin is
 * unknown. Labels reuse `account.status_*`; no fetch inside.
 */
export function OrderTimeline({ status, messages }: { status: string; messages: AccountMessages }) {
  const label = messages.timelineLabel;
  const isCancelled = status === 'CANCELLED';
  const currentIndex = (ORDER_TIMELINE_FLOW as readonly string[]).indexOf(status);

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
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'block h-6 w-px sm:hidden',
                      isDone ? 'bg-primary/60' : 'bg-border-strong',
                    )}
                  />
                )}
              </span>
              <span
                className={cn(
                  'pb-4 pt-1 text-sm sm:pb-0 sm:pt-0',
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
            <span className="flex flex-col items-center" aria-hidden="true">
              <span className="flex size-7 items-center justify-center rounded-lg border border-destructive/30 bg-destructive-subtle font-mono text-xs font-semibold text-destructive">
                {'×'}
              </span>
            </span>
            <span
              aria-current="step"
              className="pb-0 pt-1 text-sm font-semibold text-destructive sm:pt-0"
            >
              {statusLabel('CANCELLED', messages)}
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
