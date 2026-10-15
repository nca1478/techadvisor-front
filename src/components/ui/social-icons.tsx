/**
 * Footer icon set: inline SVGs using `currentColor`, so they inherit the
 * header tokens. Same 1.8 stroke as the header set; the bolt is solid fill
 * for the wordmark accent. No new dependencies, no hardcoded colors.
 */
import type { ReactNode } from 'react';
export function VoltBoltIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.2 1.5 3.8 13.4c-.3.4 0 1 .5 1H10l-1.5 8c-.1.6.7.9 1 .3l9.7-12.1c.3-.4 0-1-.5-1H13l1.2-7.4c.1-.6-.6-.9-1-.7Z" />
    </svg>
  );
}

function StrokeIcon({
  className = 'size-5',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function YouTubeIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="m10.5 9.8 4.5 2.2-4.5 2.2V9.8Z" />
    </StrokeIcon>
  );
}

export function FacebookIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="M14.5 8.5V7.2c0-.8.5-1.2 1.3-1.2h1.7V3h-2.6c-2.3 0-3.4 1.3-3.4 3.5v2H9v3h2.5v9h3v-9h2.3l.4-3h-2.7Z" />
    </StrokeIcon>
  );
}

export function LinkedInIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M8 10.5V17M8 7.2v.2M12 17v-3.8c0-1.2.8-2.2 2-2.2s2 1 2 2.2V17M12 10.5V17" />
    </StrokeIcon>
  );
}

export function InstagramIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </StrokeIcon>
  );
}

export function TikTokIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="M9.5 8v8.5a3.5 3.5 0 1 0 3.5-3.5M13 4.5v9.7M13 4.5c.4 2.4 1.8 3.9 4.5 4.1" />
    </StrokeIcon>
  );
}

export function DiscordIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="M7 8c-1.8.7-2.8 1.7-3 2l1.6 4.4c.4.9 1.1 1.6 2 2l1.2.5.8-1.6M17 8c1.8.7 2.8 1.7 3 2l-1.6 4.4c-.4.9-1.1 1.6-2 2l-1.2.5-.8-1.6" />
      <rect x="7" y="8" width="10" height="7" rx="3" />
      <path d="M9.8 11.5v1.5M14.2 11.5v1.5" />
    </StrokeIcon>
  );
}
