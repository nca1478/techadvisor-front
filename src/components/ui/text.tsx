import type { ReactNode } from 'react';
import { cn } from './cn';

const VARIANTS = {
  lead: 'text-lg leading-relaxed',
  body: 'text-base leading-relaxed',
  small: 'text-sm leading-relaxed',
  caption: 'text-xs leading-normal',
  /** Price voice: mono tabulars, tight — amounts scan in one glance. */
  price: 'price text-xl font-semibold leading-none',
  'price-md': 'price text-2xl font-semibold tracking-tight leading-none',
  'price-lg': 'price text-3xl font-semibold tracking-tight leading-none',
} as const;

const TONES = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  header: 'text-header-foreground',
  headerMuted: 'text-header-muted',
} as const;

export interface TextProps {
  as?: 'p' | 'span' | 'div';
  variant?: keyof typeof VARIANTS;
  tone?: keyof typeof TONES;
  className?: string;
  /** ARIA live-region role (`status`, `alert`) for loading/error copy. */
  role?: 'status' | 'alert';
  children: ReactNode;
}

/** Body copy with a closed size scale and four tones (all WCAG AA). */
export function Text({
  as = 'p',
  variant = 'body',
  tone = 'default',
  className,
  role,
  children,
}: TextProps) {
  const Tag = as;
  return (
    <Tag role={role} className={cn(VARIANTS[variant], TONES[tone], className)}>
      {children}
    </Tag>
  );
}
