import { createElement, type ReactNode } from 'react';
import { cn } from './cn';

const TAGS = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
} as const;

const LEVELS = {
  1: 'text-4xl md:text-5xl font-bold tracking-tight leading-tight',
  2: 'text-3xl md:text-4xl font-bold tracking-tight leading-tight',
  3: 'text-2xl font-semibold tracking-tight leading-snug',
  4: 'text-xl font-semibold leading-snug',
} as const;

export type HeadingLevel = keyof typeof LEVELS;

export interface HeadingProps {
  level?: HeadingLevel;
  className?: string;
  children: ReactNode;
}

/** Section headings: fixed size/weight/leading per level, tight tracking. */
export function Heading({ level = 2, className, children }: HeadingProps) {
  return createElement(TAGS[level], { className: cn(LEVELS[level], className) }, children);
}
