'use client';

import { useRef } from 'react';
import { cn } from '@/components/ui/cn';

function OtpDigit({
  index,
  value,
  onChange,
  onMove,
  label,
}: {
  index: number;
  value: string;
  onChange: (index: number, digit: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <input
      ref={ref}
      data-otp-index={index}
      aria-label={`${label} ${String(index + 1)}`}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={1}
      value={value}
      onChange={(event) => {
        const digit = event.target.value.replace(/\D/g, '').slice(-1);
        onChange(index, digit);
        if (digit) onMove(index, 1);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Backspace' && !value) onMove(index, -1);
      }}
      onPaste={(event) => {
        event.preventDefault();
      }}
      className={cn(
        'h-12 min-w-0 flex-1 rounded-md border bg-surface text-center text-lg font-semibold text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    />
  );
}

/**
 * Presentational 6-digit OTP field. Digits live in the container; this only
 * renders inputs and reports changes. Paste of the full code is handled by
 * the container through `onPasteCode`.
 */
export function OtpInput({
  digits,
  onChange,
  onPasteCode,
  label,
  error,
}: {
  digits: string[];
  onChange: (digits: string[]) => void;
  onPasteCode: (code: string) => void;
  label: string;
  error?: string;
}) {
  function focusDigit(index: number) {
    const clamped = Math.max(0, Math.min(5, index));
    document.querySelector<HTMLInputElement>(`input[data-otp-index="${String(clamped)}"]`)?.focus();
  }

  return (
    <div
      onPaste={(event) => {
        const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (text.length > 0) {
          event.preventDefault();
          onPasteCode(text);
          focusDigit(text.length);
        }
      }}
    >
      <div className="flex w-full gap-2" role="group" aria-label={label}>
        {digits.map((digit, index) => (
          <OtpDigit
            key={index}
            index={index}
            value={digit}
            label={label}
            onChange={(at, next) => {
              const copy = [...digits];
              copy[at] = next;
              onChange(copy);
            }}
            onMove={(at, direction) => {
              focusDigit(at + direction);
            }}
          />
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
