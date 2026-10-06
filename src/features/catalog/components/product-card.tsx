import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MediaFrame } from '@/components/ui/media-frame';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { primaryImage } from '@/lib/api/catalog';
import type { ProductListItem } from '@/lib/api/catalog';
import type { Dictionary } from '@/lib/i18n/index';
import { formatPrice } from '@/lib/money/format';

export interface ProductCardProps {
  product: ProductListItem;
  locale: string;
  currency: string;
  messages: Dictionary['catalog'];
  detailHref: string;
}

/**
 * Presentational product tile: image > name > price > action. No fetching,
 * no formatting outside `formatPrice`, no hardcoded copy (all via messages).
 */
export function ProductCard({ product, locale, currency, messages, detailHref }: ProductCardProps) {
  const image = primaryImage(product);
  const price = formatPrice(product.priceAmount, currency, locale);

  return (
    <Card padding="none">
      <a href={detailHref} aria-label={product.name} className="block rounded-t-lg">
        <MediaFrame src={image.src} alt={image.alt} rounded="sm" />
      </a>
      <Stack gap="sm" className="p-4">
        <a href={detailHref} className="line-clamp-2 text-sm font-medium text-foreground">
          {product.name}
        </a>
        <Stack direction="horizontal" gap="sm" align="center">
          <Text variant="small" as="span">
            {price}
          </Text>
          {product.inStock ? (
            <Badge tone="success">{messages.inStock}</Badge>
          ) : (
            <Badge tone="destructive">{messages.outOfStock}</Badge>
          )}
        </Stack>
        <Button size="sm" variant="secondary" disabled title={messages.addToCartUnavailable}>
          {messages.addToCart}
        </Button>
      </Stack>
    </Card>
  );
}
