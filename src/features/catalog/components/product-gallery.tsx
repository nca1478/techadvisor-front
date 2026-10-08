'use client';

import { useState } from 'react';
import { MediaFrame } from '@/components/ui/media-frame';
import { Stack } from '@/components/ui/stack';
import { cn } from '@/components/ui/cn';
import { productImageAlt } from '@/lib/api/catalog';
import type { ProductImage } from '@/lib/api/catalog';

export interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

/**
 * Presentational gallery: main image plus thumbnail strip in source order.
 * Falls back to the placeholder when the product has no images.
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images.at(active) ?? null;

  return (
    <Stack gap="md">
      <MediaFrame
        src={current?.url ?? null}
        alt={current ? productImageAlt(current, productName) : productName}
        ratio="standard"
        rounded="lg"
        priority
      />
      {images.length > 1 && (
        <div role="group" aria-label={productName} className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${String(index)}`}
              type="button"
              onClick={() => {
                setActive(index);
              }}
              aria-pressed={index === active}
              aria-label={`${productImageAlt(image, productName)} (${String(index + 1)})`}
              className={cn(
                'overflow-hidden rounded-md border',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                index === active ? 'border-primary' : 'border-border',
              )}
            >
              <MediaFrame
                src={image.url}
                alt={productImageAlt(image, productName)}
                ratio="square"
                rounded="sm"
              />
            </button>
          ))}
        </div>
      )}
    </Stack>
  );
}
