import { Grid } from '@/components/ui/grid';
import { Heading } from '@/components/ui/heading';
import { MediaFrame } from '@/components/ui/media-frame';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { CatalogCategory } from '@/lib/api/catalog';
import { categoryImageSrc } from './category-images';

export interface CategoryGridProps {
  categories: CatalogCategory[];
  hrefFor: (slug: string) => string;
  title: string;
  subtitle: string;
}

/** Photo cards linking to the pre-filtered listing (title kept over the image). */
export function CategoryGrid({ categories, hrefFor, title, subtitle }: CategoryGridProps) {
  if (categories.length === 0) return null;
  return (
    <Stack gap="md">
      <Stack gap="sm">
        <Heading level={2}>{title}</Heading>
        <Text tone="muted">{subtitle}</Text>
      </Stack>
      <Grid columns="three" gap="md">
        {categories.map((category, index) => (
          <a
            key={category.id}
            href={hrefFor(category.slug)}
            aria-label={category.name}
            className="relative block overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Decorative photo: the link already exposes the category name. */}
            <MediaFrame
              src={categoryImageSrc(category.slug)}
              alt=""
              ratio="video"
              rounded="lg"
              priority={index === 0}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-header/85 via-header/25 to-transparent"
            />
            <Text
              variant="body"
              as="span"
              className="absolute bottom-0 left-0 p-4 font-medium text-header-foreground"
            >
              {category.name}
            </Text>
          </a>
        ))}
      </Grid>
    </Stack>
  );
}
