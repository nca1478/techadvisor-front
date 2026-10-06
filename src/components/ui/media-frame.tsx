'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from './cn';

const RATIOS = {
  square: 'aspect-square',
  standard: 'aspect-4/3',
  video: 'aspect-video',
  portrait: 'aspect-3/4',
} as const;

export interface MediaFrameProps {
  src: string | null;
  /** Alternative text is mandatory: decorative images must pass alt="". */
  alt: string;
  ratio?: keyof typeof RATIOS;
  rounded?: 'sm' | 'md' | 'lg';
  priority?: boolean;
  /** Local placeholder shown when `src` is empty or fails to load. */
  fallbackSrc?: string;
  className?: string;
}

const ROUNDED = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
} as const;

/**
 * Fixed-aspect-ratio image frame (prevents layout shift). Images are cropped
 * centered with object-cover on a surface background while loading. When `src`
 * is missing or the remote image fails, `fallbackSrc` is shown instead so
 * product cards never render an empty frame.
 */
export function MediaFrame({
  src,
  alt,
  ratio = 'square',
  rounded = 'md',
  priority = false,
  fallbackSrc = '/placeholder.svg',
  className,
}: MediaFrameProps) {
  const [failed, setFailed] = useState(false);
  const effectiveSrc = src && !failed ? src : fallbackSrc;

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-surface',
        RATIOS[ratio],
        ROUNDED[rounded],
        className,
      )}
    >
      <Image
        src={effectiveSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover"
        priority={priority}
        onError={() => {
          setFailed(true);
        }}
      />
    </div>
  );
}
