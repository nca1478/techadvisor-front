import type { ReactNode } from 'react';
import { cn } from './cn';

const COLUMNS = {
  /** Product listing: 2 cols on mobile, 3 on tablet, 4 on desktop. */
  products: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  two: 'grid-cols-1 sm:grid-cols-2',
  three: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
} as const;

const GAPS = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
} as const;

export interface GridProps {
  columns?: keyof typeof COLUMNS;
  gap?: keyof typeof GAPS;
  className?: string;
  children: ReactNode;
}

/** Responsive grid with closed column presets (no arbitrary column counts). */
export function Grid({ columns = 'products', gap = 'md', className, children }: GridProps) {
  return <div className={cn('grid', COLUMNS[columns], GAPS[gap], className)}>{children}</div>;
}
