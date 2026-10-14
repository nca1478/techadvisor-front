'use client';

import Image from 'next/image';
import { Component, useState, type ReactNode } from 'react';
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
  /** Lab zoom on hover (GPU-cheap scale, motion-safe). Off by default. */
  lift?: boolean;
}

const ROUNDED = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
} as const;

/**
 * Catches synchronous render errors thrown by `next/image` (e.g. a remote
 * hostname missing from `images.remotePatterns`, or a malformed `src`).
 * The `onError` handler below only fires for async load failures, so without
 * this boundary a single unconfigured host crashes the whole page instead of
 * showing the placeholder. Renders `fallback` (always a local image, hence
 * safe). The parent passes `key={effectiveSrc}` so the boundary resets when
 * the source changes.
 */
class ImageErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(): void {
    // Intentionally silent: the fallback UI already signals the missing image.
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Fixed-aspect-ratio image frame (prevents layout shift). Images are cropped
 * centered with object-cover on a surface background while loading. When `src`
 * is missing, fails to load, or is rejected by `next/image` (unconfigured
 * remote host), `fallbackSrc` is shown instead so product cards never render
 * an empty frame — and never crash the page.
 */
export function MediaFrame({
  src,
  alt,
  ratio = 'square',
  rounded = 'md',
  priority = false,
  fallbackSrc = '/placeholder.svg',
  className,
  lift = false,
}: MediaFrameProps) {
  const [failed, setFailed] = useState(false);
  const effectiveSrc = src && !failed ? src : fallbackSrc;

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-surface-raise',
        RATIOS[ratio],
        ROUNDED[rounded],
        lift && 'media-lift',
        className,
      )}
    >
      <ImageErrorBoundary
        key={effectiveSrc}
        fallback={
          <Image
            src={fallbackSrc}
            alt={alt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
            priority={priority}
          />
        }
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
      </ImageErrorBoundary>
    </div>
  );
}
