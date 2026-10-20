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
  hrefFor: (slug: string) => string;
  title: string;
  subtitle: string;
}

/** Photo cards in a responsive grid (1 mobile / 2 tablet / 3 desktop), no horizontal scroll. */
export function CategoryGrid({ categories, hrefFor, title, subtitle }: CategoryGridProps) {
  if (categories.length === 0) return null;
  return (
    <Stack gap="md">
      <Stack gap="sm">
        <Heading level={2}>{title}</Heading>
        <Text tone="muted">{subtitle}</Text>
      </Stack>
      <ul aria-label={title} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <li key={category.id} className="min-w-0">
            <a
              href={hrefFor(category.slug)}
              aria-label={category.name}
              className="group relative block w-full overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Decorative photo: the link already exposes the category name. */}
              <MediaFrame
                src={categoryCardImage(category)}
                alt=""
                ratio="video"
                rounded="lg"
                priority={index === 0}
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
