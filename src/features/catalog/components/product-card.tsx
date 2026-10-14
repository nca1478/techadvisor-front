import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { MediaFrame } from '@/components/ui/media-frame';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { AddToCartButton } from '@/features/cart/components/add-to-cart-button';
import {
  CompareToggle,
  type CompareToggleMessages,
} from '@/features/compare/components/compare-toggle';
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
  compare?: {
    checked: boolean;
    disabled: boolean;
    messages: CompareToggleMessages;
    onToggle: (productId: string) => void;
  };
}

export function ProductCard({
  product,
  locale,
  currency,
  messages,
  detailHref,
  compare,
}: ProductCardProps) {
  const image = primaryImage(product);
  const price = formatPrice(product.priceAmount, currency, locale);

  return (
    <Card
      padding="none"
      className="group flex h-full flex-col transition-[border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
    >
      <a href={detailHref} aria-label={product.name} className="block">
        <MediaFrame src={image.src} alt={image.alt} rounded="sm" lift />
      </a>
      <Stack gap="sm" className="flex flex-1 flex-col p-4">
        <Text
          variant="caption"
          tone="muted"
          as="p"
          className="font-mono uppercase tracking-[0.1em]"
        >
          {product.brand.name}
        </Text>
        <Link
          href={detailHref}
          ariaLabel={product.name}
          className="line-clamp-2 min-h-10 text-[15px] font-medium leading-snug"
        >
          {product.name}
        </Link>
        <Stack gap="sm" className="mt-auto pt-2">
          <Stack direction="horizontal" gap="sm" align="center" justify="between">
            <Text variant="price" as="span">
              {price}
            </Text>
            {product.inStock ? (
              <Badge tone="success">{messages.inStock}</Badge>
            ) : (
              <Badge tone="destructive">{messages.outOfStock}</Badge>
            )}
          </Stack>
          <AddToCartButton
            size="sm"
            productId={product.id}
            disabled={!product.inStock}
            label={messages.addToCart}
            addedLabel={messages.addToCartAdded}
            errorLabel={messages.addToCartError}
          />
          {compare ? (
            <CompareToggle
              productId={product.id}
              productName={product.name}
              checked={compare.checked}
              disabled={compare.disabled}
              messages={compare.messages}
              onToggle={compare.onToggle}
            />
          ) : null}
        </Stack>
      </Stack>
    </Card>
  );
}
