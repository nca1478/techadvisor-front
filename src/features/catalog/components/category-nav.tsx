import { Link } from '@/components/ui/link';
import type { CatalogCategory } from '@/lib/api/catalog';

export interface CategoryNavProps {
  categories: CatalogCategory[];
  allLabel: string;
  navLabel: string;
  listHref: string;
  hrefFor: (slug: string) => string;
}

/**
 * Presentational category row for the header (ADR 0014). Horizontal scroll
 * on narrow screens, no wrapping. Renders nothing when there are no
 * categories (e.g. the API failed and the layout fell back to `[]`).
 */
export function CategoryNav({
  categories,
  allLabel,
  navLabel,
  listHref,
  hrefFor,
}: CategoryNavProps) {
  if (categories.length === 0) return null;
  return (
    <nav aria-label={navLabel}>
      <ul className="flex gap-4 overflow-x-auto py-1">
        <li className="shrink-0">
          <Link href={listHref} variant="header">
            {allLabel}
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id} className="shrink-0">
            <Link href={hrefFor(category.slug)} variant="header">
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
