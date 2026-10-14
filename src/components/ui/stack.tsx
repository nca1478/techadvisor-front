import type { ReactNode } from 'react';
import { cn } from './cn';

const DIRECTIONS = {
  vertical: 'flex-col',
  horizontal: 'flex-row',
} as const;

const GAPS = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
} as const;

const ALIGNS = {
  start: 'items-start',
  center: 'items-center',
  baseline: 'items-baseline',
  end: 'items-end',
  stretch: 'items-stretch',
} as const;

const JUSTIFIES = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const;

export interface StackProps {
  direction?: keyof typeof DIRECTIONS;
  gap?: keyof typeof GAPS;
  align?: keyof typeof ALIGNS;
  justify?: keyof typeof JUSTIFIES;
  wrap?: boolean;
  className?: string;
  children: ReactNode;
}

/** One-dimensional flex layout with a closed gap scale. */
export function Stack({
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  children,
}: StackProps) {
  return (
    <div
      className={cn(
        'flex',
        DIRECTIONS[direction],
        GAPS[gap],
        ALIGNS[align],
        JUSTIFIES[justify],
        wrap && 'flex-wrap',
        className,
      )}
    >
      {children}
    </div>
  );
}
