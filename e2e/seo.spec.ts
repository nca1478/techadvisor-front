import { expect, test } from '@playwright/test';

/**
 * SEO regression net for the Fase 1 close-out (metadata, hreflang,
 * Product JSON-LD, sitemap, robots). Runs against the same mock backend as
 * the purchase flow, so no real API is needed.
 */
test('product page exposes SEO metadata and Product JSON-LD', async ({ page }) => {
  await page.goto('/en/productos/mock-laptop-13');

  await expect(page).toHaveTitle(/Mock Laptop 13/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/en\/productos\/mock-laptop-13/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    /Mock Laptop 13/,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute(
    'href',
    /\/es\/productos\/mock-laptop-13/,
  );
  // Lighthouse SEO signals: crawlable document language, viewport and alt text.
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    'content',
    /width=device-width/,
  );
  for (const img of await page.locator('main img').all()) {
    await expect(img).toHaveAttribute('alt', /.+/);
  }

  // `<script>` bodies are not rendered text: assert on the raw content.
  const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(jsonLd).toMatch(/"@type":"Product"/);
  expect(jsonLd).toMatch(/"priceCurrency":"USD"/);
  expect(jsonLd).toMatch(/InStock/);
});

test('listing page exposes canonical, hreflang and Open Graph tags', async ({ page }) => {
  await page.goto('/en/productos');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/productos/);
  await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute(
    'href',
    /\/es\/productos/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
});

test('sitemap lists catalog slugs and robots advertises the sitemap', async ({ page }) => {
  const sitemap = await page.request.get('/sitemap.xml');
  expect(sitemap.ok()).toBeTruthy();
  const xml = await sitemap.text();
  expect(xml).toContain('mock-laptop-13');
  expect(xml).toContain('/es/productos/');

  const robots = await page.request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain('sitemap');
});
