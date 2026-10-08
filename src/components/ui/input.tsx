import { useId, type InputHTMLAttributes } from 'react';
import { cn } from './cn';

const SIZES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-3 text-sm',
} as const;

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'id'> {
  label: string;
  /** Visually hides the label (kept for screen readers) — for compact bars. */
  labelHidden?: boolean;
  size?: keyof typeof SIZES;
  error?: string;
  hint?: string;
}

/**
 * Labelled text input. The label is always rendered and linked via htmlFor;
 * errors are announced with aria-invalid + aria-describedby.
 */
export function Input({
  label,
  labelHidden = false,
  size = 'md',
  error,
  hint,
  className,
  ...rest
}: InputProps) {
  const autoId = useId();
  const id = rest.name ?? autoId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label
        htmlFor={id}
        className={labelHidden ? 'sr-only' : 'text-sm font-medium text-foreground'}
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full rounded-md border bg-background text-foreground placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-destructive' : 'border-border',
          SIZES[size],
          className,
        )}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
