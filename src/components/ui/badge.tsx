import type { ReactNode } from 'react';
import { cn } from './cn';

const TONES = {
  neutral: 'border border-border bg-surface text-muted-foreground',
  primary: 'border border-primary/40 bg-primary-subtle text-primary',
  success: 'border border-success/30 bg-success-subtle text-success',
  warning: 'border border-warning/30 bg-warning-subtle text-warning',
  destructive: 'border border-destructive/30 bg-destructive-subtle text-destructive',
} as const;

const DOTS = {
  neutral: 'bg-muted-foreground',
  primary: 'bg-primary shadow-[0_0_8px_rgb(201_242_75/0.9)]',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
} as const;

export type BadgeTone = keyof typeof TONES;

/**
 * Tone maps shared with badge-styled action buttons (same shape as `Badge`,
 * but interactive — see `ProductStatusContainer`). Reuse these instead of
 * copying the tint/dot classes.
 */
export const badgeTones: Record<BadgeTone, string> = { ...TONES };
export const badgeDots: Record<BadgeTone, string> = { ...DOTS };

export interface BadgeProps {
  tone?: keyof typeof TONES;
  className?: string;
  children: ReactNode;
}

/**
 * Status badge. Tone text sits on its own tinted ground (WCAG AA on the
 * dark lab); the dot carries the signal glow for the primary tone.
 */
export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] leading-normal',
        TONES[tone],
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', DOTS[tone])} />
      {children}
    </span>
  );
}
