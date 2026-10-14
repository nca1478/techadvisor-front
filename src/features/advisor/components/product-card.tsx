'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MediaFrame } from '@/components/ui/media-frame';
import { Text } from '@/components/ui/text';
import type { RecommendProduct } from '@/lib/api/advisor';
import { formatPrice } from '@/lib/money/format';
import { AdvisorAnswer } from './advisor-answer';

export interface ProductCardMessages {
  addToCart: string;
  addedToCart: string;
  addToCartError: string;
  viewProduct: string;
  inStock: string;
  outOfStock: string;
  sourceLabel: string;
  showSnippet: string;
  hideSnippet: string;
}

export interface ProductCardProps {
  product: RecommendProduct;
  locale: string;
  productHref: string;
  messages: ProductCardMessages;
  onAdd: (productId: string) => Promise<{ ok: true } | { ok: false }>;
}

/**
 * Hydrated recommendation card. Price, stock and links always come from the
 * `product` record (SQL via the API) — never from the LLM text. The `reason`
 * is plain text rendered through `AdvisorAnswer` (no HTML, ever).
 */
export function ProductCard({ product, locale, productHref, messages, onAdd }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleAdd = () => {
    if (adding || added) return;
    setAdding(true);
    setFailed(false);
    void onAdd(product.productId)
      .then((result) => {
        if (result.ok) {
          setAdded(true);
        } else {
          setFailed(true);
        }
      })
      .catch(() => {
        setFailed(true);
      })
      .finally(() => {
        setAdding(false);
      });
  };

  return (
    <article
      aria-label={product.name}
      className="flex gap-3 rounded-lg border border-border bg-surface-raise px-3 py-2.5"
    >
      <div className="size-16 shrink-0">
        <MediaFrame src={product.imageUrl} alt={product.name} ratio="square" rounded="sm" lift />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <a
            href={productHref}
            className="min-w-0 flex-1 truncate text-sm font-medium text-link underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {product.name}
            <span className="sr-only"> — {messages.viewProduct}</span>
          </a>
          <Badge tone={product.inStock ? 'success' : 'neutral'}>
            {product.inStock ? messages.inStock : messages.outOfStock}
          </Badge>
        </div>
        <Text variant="price" as="p">
          {formatPrice(product.priceAmount, product.currency, locale)}
        </Text>
        {product.reason.trim().length > 0 ? (
          <AdvisorAnswer
            answer={product.reason}
            citations={product.citations}
            locale={locale}
            sourceLabel={messages.sourceLabel}
            showSnippetLabel={messages.showSnippet}
            hideSnippetLabel={messages.hideSnippet}
          />
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={added ? 'primary' : 'secondary'}
            size="sm"
            loading={adding}
            disabled={adding || added || !product.inStock}
            onClick={handleAdd}
          >
            {added ? messages.addedToCart : messages.addToCart}
          </Button>
          {failed ? (
            <span role="alert" className="text-sm text-destructive">
              {messages.addToCartError}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
