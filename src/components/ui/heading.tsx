import { createElement, type ReactNode } from 'react';
import { cn } from './cn';

const TAGS = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
} as const;

const LEVELS = {
  1: 'display text-4xl md:text-6xl font-semibold tracking-[-0.01em] leading-[1.02]',
  2: 'display text-2xl md:text-4xl font-semibold tracking-[-0.01em] leading-[1.05]',
  3: 'display text-lg md:text-xl font-semibold tracking-[0.01em] leading-snug',
  4: 'text-lg font-semibold leading-snug',
} as const;

export type HeadingLevel = keyof typeof LEVELS;

const VISUALS = {
  ...LEVELS,
  /** Long product titles: between level 1 and level 2 (30px / 36px). */
  title: 'display text-3xl md:text-4xl font-semibold tracking-[-0.01em] leading-[1.05]',
} as const;

export type HeadingVisual = keyof typeof VISUALS;

export interface HeadingProps {
  level?: HeadingLevel;
  /**
   * Visual size independent of the semantic tag (e.g. an `h1` rendered
   * with `title` sizing for long product titles). Defaults to `level`,
   * so existing usage is unaffected. Needed because `className`
   * overrides are unreliable: `cn()` is a naive join and Tailwind
   * resolves same-property conflicts by stylesheet order.
   */
  visual?: HeadingVisual;
  className?: string;
  children: ReactNode;
}

/** Section headings: lab display voice (Chakra Petch) for levels 1–3,
 * body sans for level 4. Heading carries its own weight — no kickers. */
export function Heading({ level = 2, visual, className, children }: HeadingProps) {
  return createElement(
    TAGS[level],
    { className: cn(VISUALS[visual ?? level], className) },
    children,
  );
}
