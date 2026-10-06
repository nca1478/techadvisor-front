import type { ReactNode } from 'react';
import { cn } from './cn';

const VARIANTS = {
  lead: 'text-lg leading-relaxed',
  body: 'text-base leading-relaxed',
  small: 'text-sm leading-relaxed',
  caption: 'text-xs leading-normal',
} as const;

const TONES = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
} as const;

export interface TextProps {
  as?: 'p' | 'span' | 'div';
  variant?: keyof typeof VARIANTS;
  tone?: keyof typeof TONES;
  className?: string;
  children: ReactNode;
}

/** Body copy with a closed size scale and two tones (both WCAG AA). */
export function Text({
  as = 'p',
  variant = 'body',
  tone = 'default',
  className,
  children,
}: TextProps) {
  const Tag = as;
  return <Tag className={cn(VARIANTS[variant], TONES[tone], className)}>{children}</Tag>;
}
