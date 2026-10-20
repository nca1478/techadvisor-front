'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export interface AdvisorFabProps {
  locale: string;
  label: string;
  enabled?: boolean;
}

/**
 * Floating entry point to the conversational advisor, rendered from the
 * localized layout. Hidden on the `/asesor` page itself (it would link to
 * the page being viewed) and when the storefront AI kill-switch
 * (`AI_ENABLED=false`) is off.
 */
export function AdvisorFab({ locale, label, enabled = true }: AdvisorFabProps) {
  const pathname = usePathname();
  if (!enabled) {
    return null;
  }
  if (pathname.endsWith('/asesor')) {
    return null;
  }
  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      <Button href={`/${locale}/asesor`} aria-label={label} size="lg" className="shadow-lg">
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 3.5h13v8h-7l-3.5 3v-3H2.5v-8Z" />
          <circle cx="6.5" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="9.5" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="12.5" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
        </svg>
        {label}
      </Button>
    </div>
  );
}
