import NextLink from 'next/link';
import type { ReactNode } from 'react';
import { cn } from './cn';

const VARIANTS = {
  default: 'text-link underline-offset-4 hover:text-link-hover hover:underline',
  muted: 'text-muted-foreground underline-offset-4 hover:text-foreground hover:underline',
  header:
    'text-header-foreground no-underline transition-colors duration-150 hover:text-primary hover:no-underline',
  /** Brand wordmark: header color, never underlined (not a text link). */
  brand: 'text-header-foreground no-underline transition-colors duration-150 hover:text-primary',
} as const;

export interface LinkProps {
  href: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
  /** Accessible name override (e.g. "Cart, 3 items" for a badge link). */
  ariaLabel?: string;
  /** Native tooltip (e.g. full product name on truncated text). */
  title?: string;
  children: ReactNode;
}

/** Text link: primary or muted, underline on hover, visible focus ring. */
export function Link({
  href,
  variant = 'default',
  className,
  ariaLabel,
  title,
  children,
}: LinkProps) {
  const external = href.startsWith('http');
  return (
    <NextLink
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
      {...(title !== undefined ? { title } : {})}
      className={cn(
        'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </NextLink>
  );
}
