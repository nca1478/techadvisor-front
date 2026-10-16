'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@/components/ui/link';
import type { CatalogCategory } from '@/lib/api/catalog';

export interface CategoryNavProps {
  categories: CatalogCategory[];
  allLabel: string;
  navLabel: string;
  scrollPrevLabel: string;
  scrollNextLabel: string;
  listHref: string;
  /** Category URL template with a `{slug}` placeholder, e.g. `/es/productos?category={slug}`. */
  categoryHrefTemplate: string;
}

/**
 * Presentational category row for the header (ADR 0014). Single
 * scrollable line on small screens with primary arrows revealing the
 * overflow (same pattern as the admin nav); no wrapping, no visible
 * scrollbar. Renders nothing when there are no categories (e.g. the API
 * failed and the layout fell back to `[]`).
 */
export function CategoryNav({
  categories,
  allLabel,
  navLabel,
  scrollPrevLabel,
  scrollNextLabel,
  listHref,
  categoryHrefTemplate,
}: CategoryNavProps) {
  const listRef = useRef<HTMLUListElement>(null);
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
  }, [updateArrows, categories.length]);

  function scrollNav(direction: -1 | 1) {
    const list = listRef.current;
    if (!list || typeof list.scrollBy !== 'function') return;
    list.scrollBy({ left: direction * Math.max(160, list.clientWidth * 0.6), behavior: 'smooth' });
  }

  if (categories.length === 0) return null;
  return (
    <nav aria-label={navLabel}>
      <div className="relative">
        <ul
          ref={listRef}
          onScroll={updateArrows}
          className="flex gap-4 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <li className="shrink-0">
            <Link href={listHref} variant="header">
              {allLabel}
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id} className="shrink-0">
              <Link
                href={categoryHrefTemplate.replace('{slug}', encodeURIComponent(category.slug))}
                variant="header"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
        {canScrollPrev ? (
          <button
            type="button"
            aria-label={scrollPrevLabel}
            onClick={() => {
              scrollNav(-1);
            }}
            className="absolute top-1/2 left-0 size-8 -translate-y-1/2 cursor-pointer rounded-full bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            aria-label={scrollNextLabel}
            onClick={() => {
              scrollNav(1);
            }}
            className="absolute top-1/2 right-0 size-8 -translate-y-1/2 cursor-pointer rounded-full bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
