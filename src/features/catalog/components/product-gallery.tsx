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
        fit="contain"
        tone="light"
        className="border border-border p-6"
      />
      {images.length > 1 && (
        <div role="group" aria-label={productName} className="flex gap-4 overflow-x-auto pb-1">
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
                'w-20 shrink-0 overflow-hidden rounded-md border transition-shadow duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                index === active
                  ? 'border-primary shadow-[0_0_12px_rgb(201_242_75/0.35)]'
                  : 'border-border',
              )}
            >
              <MediaFrame
                src={image.url}
                alt={productImageAlt(image, productName)}
                ratio="square"
                rounded="sm"
                fit="contain"
                tone="light"
                className="p-1"
              />
            </button>
          ))}
        </div>
      )}
    </Stack>
  );
}
