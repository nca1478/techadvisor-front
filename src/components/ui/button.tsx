import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

const VARIANTS = {
  primary:
    'bg-primary text-primary-foreground font-semibold hover:bg-primary-hover active:bg-primary-active shadow-[0_0_0_1px_rgb(201_242_75/0.35),0_8px_24px_-8px_rgb(201_242_75/0.55)] hover:shadow-[0_0_0_1px_rgb(201_242_75/0.5),0_10px_32px_-8px_rgb(201_242_75/0.7)]',
  secondary:
    'border border-border-strong bg-surface text-foreground hover:border-primary/60 hover:bg-surface-raise',
  dark: 'bg-surface-raise text-foreground border border-border hover:border-primary/50 hover:bg-surface',
  danger: 'bg-destructive text-destructive-foreground hover:opacity-90',
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-surface',
  link: 'h-auto p-0 text-link underline-offset-4 hover:text-link-hover hover:underline',
} as const;

const SIZES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
  href?: string;
  children: ReactNode;
}

/**
 * Button with 5 variants x 3 sizes. Renders an anchor when `href` is given,
 * otherwise a native button. `loading` shows a spinner, announces busy state
 * and disables interaction.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  href,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-[-0.01em] transition-[background-color,border-color,box-shadow,transform,color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]',
    'cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
    VARIANTS[variant],
    variant !== 'link' && SIZES[size],
    className,
  );

  const content = (
    <>
      {loading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </>
  );

  if (href !== undefined && !disabled && !loading) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      aria-disabled={href !== undefined && (disabled || loading) ? true : undefined}
      className={classes}
      {...rest}
    >
      {content}
    </button>
  );
}
