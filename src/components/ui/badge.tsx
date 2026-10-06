import type { ReactNode } from 'react';
import { cn } from './cn';

const TONES = {
  neutral: 'bg-surface text-muted-foreground',
  primary: 'bg-primary-subtle text-foreground',
  success: 'bg-success-subtle text-foreground',
  warning: 'bg-warning-subtle text-foreground',
  destructive: 'bg-destructive-subtle text-foreground',
} as const;

const DOTS = {
  neutral: 'bg-muted-foreground',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
} as const;

export interface BadgeProps {
  tone?: keyof typeof TONES;
  className?: string;
  children: ReactNode;
}

/**
 * Status badge. Text always uses the foreground token on a subtle tint
 * (keeps WCAG AA); the tone is carried by a decorative dot.
 */
export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium leading-normal',
        TONES[tone],
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', DOTS[tone])} />
      {children}
    </span>
  );
}
