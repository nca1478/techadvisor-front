import type { ReactNode } from 'react';
import { cn } from './cn';

const VARIANTS = {
  default: 'border border-border bg-surface shadow-md',
  outline: 'border border-border-strong bg-transparent',
  ghost: 'bg-transparent',
  raise: 'border border-border bg-surface-raise shadow-md',
} as const;

const PADDINGS = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
} as const;

export interface CardProps {
  variant?: keyof typeof VARIANTS;
  padding?: keyof typeof PADDINGS;
  className?: string;
  children: ReactNode;
}

/** Lab panel: single flat surface. Never nest Card inside Card — compose
 * sections with dividers and spacing instead (anti-pattern audit 0043). */
export function Card({ variant = 'default', padding = 'sm', className, children }: CardProps) {
  return (
    <div
      className={cn('overflow-hidden rounded-xl', VARIANTS[variant], PADDINGS[padding], className)}
    >
      {children}
    </div>
  );
}
