'use client';

import { useEffect, useMemo, useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { MediaFrame } from '@/components/ui/media-frame';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { CatalogCategory } from '@/lib/api/catalog';
import { nullableString } from '@/lib/api/catalog';
import { categoryImageSrc } from './category-images';

/** Backend cover first, curated slug photo second, placeholder last (via MediaFrame). */
export function categoryCardImage(
  category: Pick<CatalogCategory, 'imageUrl' | 'slug'>,
): string | null {
  return nullableString(category.imageUrl) ?? categoryImageSrc(category.slug);
}

export interface CategoryGridProps {
  categories: CatalogCategory[];
  /** Locale prefix used to build `/[locale]/productos?category=` links (no function props to Client Components). */
  locale: string;
  title: string;
  subtitle: string;
  prevLabel?: string;
  nextLabel?: string;
  /** Test-only override for page size (production uses the responsive hook). */
  pageSize?: PerPage;
}

type PerPage = 1 | 2 | 3;

/** Responsive page size: 1 mobile / 2 tablet (md) / 3 desktop (lg). */
function usePerPage(): PerPage {
  const [perPage, setPerPage] = useState<PerPage>(1);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mqDesktop = window.matchMedia('(min-width: 1024px)');
    const mqTablet = window.matchMedia('(min-width: 768px)');
    const update = () => {
      setPerPage(mqDesktop.matches ? 3 : mqTablet.matches ? 2 : 1);
    };
    update();
    mqDesktop.addEventListener('change', update);
    mqTablet.addEventListener('change', update);
    return () => {
      mqDesktop.removeEventListener('change', update);
      mqTablet.removeEventListener('change', update);
    };
  }, []);
  return perPage;
}

/**
 * Paged slider without scroll: grid 1/2/3 per breakpoint, prev/next buttons
 * swap the visible page (no `overflow-x`, no scrollbar, no snap).
 */
export function CategoryGrid({
  categories,
  locale,
  title,
  subtitle,
  prevLabel = 'Categorías anteriores',
  nextLabel = 'Categorías siguientes',
  pageSize,
}: CategoryGridProps) {
  const responsivePerPage = usePerPage();
  const perPage = pageSize ?? responsivePerPage;
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const pageCount = Math.max(1, Math.ceil(categories.length / perPage));
  const safePage = Math.min(page, pageCount - 1);
  const enterClass = direction === 1 ? 'category-card-enter-right' : 'category-card-enter-left';

  const visible = useMemo(
    () => categories.slice(safePage * perPage, safePage * perPage + perPage),
    [categories, safePage, perPage],
  );

  if (categories.length === 0) return null;
  const showControls = categories.length > perPage;

  return (
    <Stack gap="md">
      <Stack direction="horizontal" justify="between" align="end" gap="md">
        <Stack gap="sm">
          <Heading level={2}>{title}</Heading>
          <Text tone="muted">{subtitle}</Text>
        </Stack>
        {showControls && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={prevLabel}
              disabled={safePage === 0}
              onClick={() => {
                setDirection(-1);
                setPage((current) => Math.max(0, current - 1));
              }}
              className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-surface text-foreground transition-[background-color,border-color,opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-primary/60 hover:bg-surface-raise focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M10 3 5 8l5 5" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              disabled={safePage >= pageCount - 1}
              onClick={() => {
                setDirection(1);
                setPage((current) => Math.min(pageCount - 1, current + 1));
              }}
              className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-surface text-foreground transition-[background-color,border-color,opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-primary/60 hover:bg-surface-raise focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          </div>
        )}
      </Stack>
      <ul
        key={`category-page-${String(safePage)}`}
        aria-label={title}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((category, index) => (
          <li
            key={category.id}
            className={`min-w-0 ${enterClass}`}
            style={{ animationDelay: `${String(index * 40)}ms` }}
          >
            <a
              href={`/${locale}/productos?category=${encodeURIComponent(category.slug)}`}
              aria-label={category.name}
              className="group relative block w-full overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Decorative photo: the link already exposes the category name. */}
              <MediaFrame
                src={categoryCardImage(category)}
                alt=""
                ratio="video"
                rounded="lg"
                priority={index === 0 && safePage === 0}
                lift
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-header/85 via-header/25 to-transparent"
              />
              <Text
                variant="body"
                as="span"
                className="pointer-events-none absolute bottom-0 left-0 p-4 font-medium text-header-foreground"
              >
                {category.name}
              </Text>
            </a>
          </li>
        ))}
      </ul>
    </Stack>
  );
}
