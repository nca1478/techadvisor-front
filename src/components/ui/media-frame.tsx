import Image from 'next/image';
import { cn } from './cn';

const RATIOS = {
  square: 'aspect-square',
  standard: 'aspect-4/3',
  video: 'aspect-video',
  portrait: 'aspect-3/4',
} as const;

export interface MediaFrameProps {
  src: string;
  /** Alternative text is mandatory: decorative images must pass alt="". */
  alt: string;
  ratio?: keyof typeof RATIOS;
  rounded?: 'sm' | 'md' | 'lg';
  priority?: boolean;
  className?: string;
}

const ROUNDED = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
} as const;

/**
 * Fixed-aspect-ratio image frame (prevents layout shift). Images are cropped
 * centered with object-cover on a surface background while loading.
 */
export function MediaFrame({
  src,
  alt,
  ratio = 'square',
  rounded = 'md',
  priority = false,
  className,
}: MediaFrameProps) {
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
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover"
        priority={priority}
      />
    </div>
  );
}
