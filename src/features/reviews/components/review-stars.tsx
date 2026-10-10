import { cn } from '@/components/ui/cn';

export interface ReviewStarsProps {
  rating: number;
  /** Accessible label, e.g. "Rated 4 out of 5". */
  label: string;
  className?: string;
}

/**
 * Presentational star rating (read-only). Filled/empty glyphs are
 * decorative; the numeric rating travels in the accessible label.
 */
export function ReviewStars({ rating, label, className }: ReviewStarsProps) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span
      role="img"
      aria-label={label}
      className={cn('inline-flex items-center gap-0.5 text-sm text-foreground', className)}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden="true" className={index < full ? '' : 'opacity-30'}>
          ★
        </span>
      ))}
    </span>
  );
}
