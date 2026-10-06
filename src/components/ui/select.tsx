import { useId, type SelectHTMLAttributes } from 'react';
import { cn } from './cn';

const SIZES = {
  sm: 'h-8 px-2 text-sm',
  md: 'h-10 px-3 text-sm',
} as const;

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'id'> {
  label: string;
  size?: keyof typeof SIZES;
  error?: string;
  hint?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder?: string;
}

/**
 * Labelled native select. The label is always rendered and linked via
 * htmlFor; errors are announced with aria-invalid + aria-describedby.
 * Minimum touch height follows the Input primitive (40 px at `md`).
 */
export function Select({
  label,
  size = 'md',
  error,
  hint,
  options,
  placeholder,
  className,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const id = rest.name ?? autoId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full rounded-md border bg-background text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-destructive' : 'border-border',
          SIZES[size],
          className,
        )}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
