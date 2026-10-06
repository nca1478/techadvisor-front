import type { NextConfig } from 'next';

/**
 * External image hosts for catalog `imageUrl`s (ADR 0006). Comma-separated
 * `IMAGE_REMOTE_HOSTS` (e.g. `cdn.example.com,placehold.co`); defaults to the
 * seed placeholder host so the catalog works without configuration.
 */
function remotePatterns(): { protocol: 'https'; hostname: string }[] {
  const raw = process.env['IMAGE_REMOTE_HOSTS'] ?? 'placehold.co';
  const hosts = raw
    .split(',')
    .map((host) => host.trim())
    .filter((host) => host.length > 0);
  return hosts.map((hostname) => ({ protocol: 'https' as const, hostname }));
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: remotePatterns(),
  },
};

export default nextConfig;
