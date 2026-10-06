import NextLink from 'next/link';
import type { ReactNode } from 'react';
import { cn } from './cn';

const VARIANTS = {
  default: 'text-primary underline-offset-4 hover:underline',
  muted: 'text-muted-foreground underline-offset-4 hover:text-foreground hover:underline',
} as const;

export interface LinkProps {
  href: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
  children: ReactNode;
}

/** Text link: primary or muted, underline on hover, visible focus ring. */
export function Link({ href, variant = 'default', className, children }: LinkProps) {
  const external = href.startsWith('http');
  return (
    <NextLink
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
