'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Dictionary } from '@/lib/i18n/index';

export type AdminSection =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'inventory'
  | 'documents'
  | 'asesor'
  | 'reviews';

/**
 * Presentational back-office section nav; active section follows the URL.
 * Same pill design as the `Tabs` primitive (active = primary, rest =
 * secondary, size sm). Below `lg` the pills stay on a single scrollable
 * line with primary arrows revealing the overflow (same pattern as the
 * product wizard stepper); desktop keeps the wrapping layout.
 */
export function AdminNav({ locale, messages }: { locale: string; messages: Dictionary['admin'] }) {
  const pathname = usePathname();
  const items: Array<{ section: AdminSection; href: string; label: string }> = [
    { section: 'dashboard', href: `/${locale}/admin`, label: messages.navDashboard },
    { section: 'products', href: `/${locale}/admin/productos`, label: messages.navProducts },
    { section: 'categories', href: `/${locale}/admin/categorias`, label: messages.navCategories },
    { section: 'orders', href: `/${locale}/admin/ordenes`, label: messages.navOrders },
    { section: 'inventory', href: `/${locale}/admin/inventario`, label: messages.navInventory },
    { section: 'documents', href: `/${locale}/admin/documentos`, label: messages.navDocuments },
    { section: 'asesor', href: `/${locale}/admin/asesor`, label: messages.navAsesor },
    { section: 'reviews', href: `/${locale}/admin/resenas`, label: messages.navReviews },
  ];

  const listRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateArrows = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setCanScrollPrev(list.scrollLeft > 1);
    setCanScrollNext(list.scrollLeft + list.clientWidth < list.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => {
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  // Keep the active section visible when the route changes (mobile strip).
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = items.find((item) =>
      item.section === 'dashboard' ? pathname === item.href : pathname.startsWith(item.href),
    );
    const link = active ? list.querySelector<HTMLElement>(`a[href="${active.href}"]`) : null;
    if (link && typeof list.scrollTo === 'function') {
      const left = link.offsetLeft - list.clientWidth / 2 + link.clientWidth / 2;
      list.scrollTo({ left, behavior: 'smooth' });
    }
    updateArrows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, updateArrows]);

  function scrollNav(direction: -1 | 1) {
    const list = listRef.current;
    if (!list || typeof list.scrollBy !== 'function') return;
    list.scrollBy({ left: direction * Math.max(160, list.clientWidth * 0.6), behavior: 'smooth' });
  }

  return (
    <nav aria-label={messages.title}>
      <div className="relative">
        <div
          ref={listRef}
          onScroll={updateArrows}
          className="flex flex-nowrap items-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible lg:py-0"
        >
          {items.map((item) => {
            const active =
              item.section === 'dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Button
                key={item.section}
                href={item.href}
                variant={active ? 'primary' : 'secondary'}
                size="sm"
                className="shrink-0"
              >
                {item.label}
              </Button>
            );
          })}
        </div>
        {canScrollPrev ? (
          <button
            type="button"
            aria-label={messages.navScrollPrev}
            onClick={() => {
              scrollNav(-1);
            }}
            className="absolute top-1/2 left-0 size-8 -translate-y-1/2 cursor-pointer rounded-full bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto size-4"
            >
              <path d="M10 3 5 8l5 5" />
            </svg>
          </button>
        ) : null}
        {canScrollNext ? (
          <button
            type="button"
            aria-label={messages.navScrollNext}
            onClick={() => {
              scrollNav(1);
            }}
            className="absolute top-1/2 right-0 size-8 -translate-y-1/2 cursor-pointer rounded-full bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto size-4"
            >
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        ) : null}
      </div>
    </nav>
  );
}
