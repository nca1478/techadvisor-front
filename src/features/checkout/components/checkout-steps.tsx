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
    <ol aria-label={label} className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
                'flex size-6 items-center justify-center rounded-full text-xs font-bold',
                isCurrent || isDone
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-surface text-muted-foreground',
              )}
            >
              {number}
            </span>
            <span
              className={cn(
                'text-sm',
                isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
