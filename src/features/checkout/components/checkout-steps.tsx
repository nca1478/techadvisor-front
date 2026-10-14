import { cn } from '@/components/ui/cn';

export interface CheckoutStepsMessages {
  address: string;
  payment: string;
  done: string;
}

/**
 * Presentational checkout progress: Dirección → Pago → Confirmación.
 * Numbering is legitimate here because checkout IS a sequence. The
 * current step carries `aria-current="step"`; there is no interaction.
 */
export function CheckoutSteps({
  label,
  current,
  messages,
}: {
  label: string;
  current: 1 | 2 | 3;
  messages: CheckoutStepsMessages;
}) {
  const steps = [messages.address, messages.payment, messages.done];
  return (
    <ol aria-label={label} className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {steps.map((step, index) => {
        const number = index + 1;
        const isCurrent = number === current;
        const isDone = number < current;
        return (
          <li
            key={step}
            className="flex items-center gap-2"
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex size-7 items-center justify-center rounded-lg font-mono text-xs font-semibold',
                isCurrent
                  ? 'bg-primary text-primary-foreground shadow-[0_0_16px_rgb(201_242_75/0.45)]'
                  : isDone
                    ? 'border border-primary/50 bg-primary-subtle text-primary'
                    : 'border border-border bg-surface text-muted-foreground',
              )}
            >
              {number}
            </span>
            <span
              className={cn(
                'text-sm',
                isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  'mx-2 h-px w-8',
                  number < current ? 'bg-primary/60' : 'bg-border-strong',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
