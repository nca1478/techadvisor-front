'use client';

import { MoonIcon, SunIcon } from '@/components/ui/header-icons';
import { useTheme } from '../theme-context';

export interface ThemeToggleMessages {
  switchToLight: string;
  switchToDark: string;
}

/**
 * Header theme switch: one 32px icon slot matching the neighbouring header
 * icons (size-6 glyph + p-1). Shows the sun while the lab sits dark (the
 * action leads to daylight) and the moon while the page reads light. The
 * accessible name always names the action, never the state.
 */
export function ThemeToggle({
  messages,
  showLabel = false,
}: {
  messages: ThemeToggleMessages;
  /** Visible text label next to the icon (mobile menu rows); icon-only otherwise. */
  showLabel?: boolean;
}) {
  const { theme, toggle } = useTheme();
  const toLight = theme === 'dark';
  const label = toLight ? messages.switchToLight : messages.switchToDark;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={
        showLabel
          ? 'inline-flex w-full cursor-pointer items-center gap-3 px-1 py-1.5 text-header-foreground no-underline transition-colors duration-150 hover:text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          : 'inline-flex cursor-pointer items-center p-1 text-header-foreground no-underline transition-colors duration-150 hover:text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      }
    >
      {toLight ? <SunIcon className="size-6" /> : <MoonIcon className="size-6" />}
      {showLabel ? (
        <span aria-hidden="true" className="text-sm">
          {label}
        </span>
      ) : null}
    </button>
  );
}
