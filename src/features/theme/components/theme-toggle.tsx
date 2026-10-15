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
export function ThemeToggle({ messages }: { messages: ThemeToggleMessages }) {
  const { theme, toggle } = useTheme();
  const toLight = theme === 'dark';
  const label = toLight ? messages.switchToLight : messages.switchToDark;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex cursor-pointer items-center p-1 text-header-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {toLight ? <SunIcon className="size-6" /> : <MoonIcon className="size-6" />}
    </button>
  );
}
