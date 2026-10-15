/**
 * Fallback background photo per category slug (ADR 0023, backend ADR 0052).
 *
 * The backend is now the source of truth (`Category.imageUrl`, editable from
 * the admin panel and seeded with these same photos). This map only covers
 * slugs without a stored image so the grid never breaks when a category has
 * no cover yet — callers prefer `category.imageUrl` first.
 *
 * Photos are hotlinked from `images.unsplash.com` (stable photo IDs,
 * verified HTTP 200). The host must stay listed in `IMAGE_REMOTE_HOSTS`
 * (`next.config.ts` + `.env.example`); if a photo ever fails, `MediaFrame`
 * shows `/placeholder.svg` instead of crashing the page.
 */
const CATEGORY_IMAGES: Record<string, string> = {
  laptops:
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
  cpus: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800&auto=format&fit=crop',
  motherboards:
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
  ram: 'https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=800&auto=format&fit=crop',
  gpus: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=800&auto=format&fit=crop',
  storage:
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=800&auto=format&fit=crop',
  psus: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop',
  monitors:
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop',
};

/** Related background photo for a category slug, or `null` when unknown. */
export function categoryImageSrc(slug: string): string | null {
  return CATEGORY_IMAGES[slug] ?? null;
}
