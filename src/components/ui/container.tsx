import type { ReactNode } from 'react';
import { cn } from './cn';

const SIZES = {
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
} as const;

export type ContainerSize = keyof typeof SIZES;

export interface ContainerProps {
  size?: ContainerSize;
  className?: string;
  children: ReactNode;
}

/** Centered page container: single max width scale + fixed gutters. */
export function Container({ size = 'xl', className, children }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', SIZES[size], className)}>
      {children}
    </div>
  );
}
