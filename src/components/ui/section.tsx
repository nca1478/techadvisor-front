import type { ReactNode } from 'react';
import { cn } from './cn';

const SPACINGS = {
  default: 'py-12 md:py-20',
  tight: 'py-8 md:py-12',
} as const;

export type SectionSpacing = keyof typeof SPACINGS;

export interface SectionProps {
  spacing?: SectionSpacing;
  className?: string;
  children: ReactNode;
}

/** Vertical section rhythm: generous whitespace between page sections. */
export function Section({ spacing = 'default', className, children }: SectionProps) {
  return <section className={cn(SPACINGS[spacing], className)}>{children}</section>;
}
