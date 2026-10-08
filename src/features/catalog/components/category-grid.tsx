import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { CatalogCategory } from '@/lib/api/catalog';

export interface CategoryGridProps {
  categories: CatalogCategory[];
  hrefFor: (slug: string) => string;
  title: string;
  subtitle: string;
}

/** Presentational category tiles linking to the pre-filtered listing. */
export function CategoryGrid({ categories, hrefFor, title, subtitle }: CategoryGridProps) {
  if (categories.length === 0) return null;
  return (
    <Stack gap="md">
      <Stack gap="sm">
        <Heading level={2}>{title}</Heading>
        <Text tone="muted">{subtitle}</Text>
      </Stack>
      <Grid columns="three" gap="md">
        {categories.map((category) => (
          <a key={category.id} href={hrefFor(category.slug)} aria-label={category.name}>
            <Card>
              <Text variant="body" as="span" className="font-medium">
                {category.name}
              </Text>
            </Card>
          </a>
        ))}
      </Grid>
    </Stack>
  );
}
