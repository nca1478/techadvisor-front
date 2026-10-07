import { describe, expect, it } from 'vitest';
import { absoluteUrl, majorAmount, productJsonLd, siteUrl } from './site';

const PRODUCT = {
  name: 'Mock Laptop 13',
  description: 'A mock 13-inch laptop for tests.',
  sku: 'MOCK-LAPTOP-13',
  priceAmount: 129900,
  currency: 'USD',
  inStock: true,
  brand: { id: 'b1', name: 'MockBrand', slug: 'mockbrand' },
  images: [{ url: 'https://cdn.example.com/p/laptop.jpg', alt: null, position: 0 }],
};

describe('siteUrl', () => {
  it('falls back to the local origin and strips trailing slashes', () => {
    expect(siteUrl()).toBe('http://localhost:3000');
    expect(absoluteUrl('en/productos/x')).toBe('http://localhost:3000/en/productos/x');
  });
});

describe('majorAmount', () => {
  it('converts minor units using the currency exponent', () => {
    expect(majorAmount(129900, 'USD')).toBe(1299);
    expect(majorAmount(1500, 'JPY')).toBe(1500);
  });
});

describe('productJsonLd', () => {
  it('builds a Product node with price, currency and availability', () => {
    const node = productJsonLd({ product: PRODUCT, locale: 'en', path: '/en/productos/x' });
    expect(node['@type']).toBe('Product');
    expect(node['name']).toBe('Mock Laptop 13');
    const offers = node['offers'] as Record<string, unknown>;
    expect(offers['priceCurrency']).toBe('USD');
    expect(offers['price']).toBe(1299);
    expect(offers['availability']).toBe('https://schema.org/InStock');
  });

  it('marks out-of-stock products and omits empty images', () => {
    const node = productJsonLd({
      product: { ...PRODUCT, inStock: false, images: [] },
      locale: 'es',
      path: '/es/productos/x',
    });
    const offers = node['offers'] as Record<string, unknown>;
    expect(offers['availability']).toBe('https://schema.org/OutOfStock');
    expect(node).not.toHaveProperty('image');
  });
});
