import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo/site';

/** Public crawl policy: everything indexable, sitemap advertised. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
