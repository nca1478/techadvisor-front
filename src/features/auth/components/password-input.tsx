'use client';

import { useState } from 'react';
import { cn } from '@/components/ui/cn';
import { EyeIcon, EyeOffIcon } from '@/components/ui/header-icons';

/**
 * Presentational password field with an icon reveal toggle. Mirrors the
 * shared `Input` markup/tokens (label, error, hint); the icon button sits
 * inside the right edge (`w-12` zone) and the text starts with matching
 * left padding so both sides breathe equally. Visibility state is local
 * per field.
 */
export function PasswordInput({
  label,
  name,
  autoComplete = 'new-password',
  value,
  error,
  hint,
  showLabel,
  hideLabel,
  onChange,
  disabled = false,
}: {
  label: string;
  name: string;
  autoComplete?: string;
  value: string;
  error?: string;
  hint?: string;
  showLabel: string;
  hideLabel: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = name;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative w-full">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          disabled={disabled}
          className={cn(
            'h-10 w-full rounded-md border bg-surface pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-destructive' : 'border-border',
          )}
        />
        <button
          type="button"
          aria-pressed={visible}
          aria-label={visible ? hideLabel : showLabel}
          title={visible ? hideLabel : showLabel}
          onClick={() => {
            setVisible((current) => !current);
          }}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
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
