'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export interface AdvisorFabProps {
  locale: string;
  label: string;
}

/**
 * Floating entry point to the conversational advisor, rendered from the
 * localized layout. Hidden on the `/asesor` page itself (it would link to
 * the page being viewed).
 */
export function AdvisorFab({ locale, label }: AdvisorFabProps) {
  const pathname = usePathname();
  if (pathname.endsWith('/asesor')) {
    return null;
  }
  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      <Button href={`/${locale}/asesor`} aria-label={label} size="lg" className="shadow-lg">
        <span aria-hidden="true">{'💬'}</span>
        {label}
      </Button>
    </div>
  );
}
