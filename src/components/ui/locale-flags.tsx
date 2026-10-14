/**
 * Locale flag pictograms: tiny inline SVG flags (3:2) for the header language
 * menu. Flag colors are the flags' own content colors (like product imagery),
 * not UI chrome — every other style still uses the design tokens.
 * Kept dependency-free; emoji flags render as plain letters on Windows.
 */
export function EsFlagIcon({ className = 'h-4 w-6' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 14" className={className}>
      <rect width="20" height="14" fill="#AA151B" />
      <rect y="3.5" width="20" height="7" fill="#F1BF00" />
    </svg>
  );
}

export function GbFlagIcon({ className = 'h-4 w-6' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 14" className={className}>
      <rect width="20" height="14" fill="#012169" />
      <path d="M0 0l20 14M20 0L0 14" stroke="#ffffff" strokeWidth="2.8" />
      <path d="M0 0l20 14M20 0L0 14" stroke="#C8102E" strokeWidth="1.1" />
      <path d="M10 0v14M0 7h20" stroke="#ffffff" strokeWidth="4.6" />
      <path d="M10 0v14M0 7h20" stroke="#C8102E" strokeWidth="2.6" />
    </svg>
  );
}
