'use client';

import { useId, useState, type ReactNode } from 'react';
import { Badge } from './badge';
import { Card } from './card';
import { cn } from './cn';

export interface DisclosureProps {
  title: string;
  defaultOpen?: boolean;
  /** Active-filter count shown as a badge on the trigger (omitted when 0). */
  count?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Collapsible Card section with a single trigger. Closed content unmounts
 * (callers must keep their state outside, e.g. in the URL). The trigger
 * announces expanded/collapsed via `aria-expanded`.
 */
export function Disclosure({
  title,
  defaultOpen = false,
  count = 0,
  className,
  children,
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const regionId = useId();
  return (
    <Card padding="none" className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className="flex w-full items-center justify-between gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6"
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          {title}
          {count > 0 ? (
            <>
              {' '}
              <Badge tone="primary">{String(count)}</Badge>
            </>
          ) : null}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'size-2 shrink-0 rotate-45 border-b-2 border-r-2 border-current text-muted-foreground',
            open && 'rotate-180',
          )}
        />
      </button>
      {open ? (
        <div id={regionId} className="border-t border-border p-4 sm:px-6">
          {children}
        </div>
      ) : null}
    </Card>
  );
}
