import type { NextConfig } from 'next';

/**
 * External image hosts for catalog `imageUrl`s (ADR 0006). Comma-separated
 * `IMAGE_REMOTE_HOSTS` (e.g. `cdn.example.com,placehold.co`); defaults to the
 * seed placeholder host so the catalog works without configuration.
 */
function remotePatterns(): { protocol: 'https'; hostname: string }[] {
  const raw = process.env['IMAGE_REMOTE_HOSTS'] ?? 'placehold.co,images.unsplash.com';
  const hosts = raw
    .split(',')
    .map((host) => host.trim())
    .filter((host) => host.length > 0);
  return hosts.map((hostname) => ({ protocol: 'https' as const, hostname }));
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: remotePatterns(),
    // The seed hosts (placehold.co) serve `image/svg+xml`. Next.js refuses to
    // optimize SVGs by default (embedded scripts are an XSS vector), so the
    // catalog cards/detail error at runtime without this. SVGs here come from
    // static generator hosts, never from user uploads, and scripts inside
    // them are neutralized with the strict CSP below (ADR 0006, amendment).
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
