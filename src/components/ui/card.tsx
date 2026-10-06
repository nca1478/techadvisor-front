import type { ReactNode } from 'react';
import { cn } from './cn';

const VARIANTS = {
  default: 'border border-border bg-background shadow-sm',
  outline: 'border border-border bg-background',
  ghost: 'bg-surface',
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

/** Surface container with locked radius, border and shadow tokens. */
export function Card({ variant = 'default', padding = 'sm', className, children }: CardProps) {
  return (
    <div
      className={cn('overflow-hidden rounded-lg', VARIANTS[variant], PADDINGS[padding], className)}
    >
      {children}
    </div>
  );
}
