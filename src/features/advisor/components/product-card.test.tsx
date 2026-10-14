import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { RecommendProduct } from '@/lib/api/advisor';
import { formatPrice } from '@/lib/money/format';
import { ProductCard, type ProductCardMessages } from './product-card';

const messages: ProductCardMessages = {
  addToCart: 'Agregar al carrito',
  addedToCart: 'Agregado al carrito',
  addToCartError: 'No se pudo agregar este producto al carrito.',
  viewProduct: 'Ver producto',
  inStock: 'En stock',
  outOfStock: 'Agotado',
  sourceLabel: 'Fuentes',
  showSnippet: 'Ver fragmento',
  hideSnippet: 'Ocultar',
};

const product: RecommendProduct = {
  productId: 'prod-1',
  name: 'Mock Laptop 13',
  slug: 'mock-laptop-13',
  priceAmount: 129900,
  currency: 'USD',
  inStock: true,
  availableQuantity: 7,
  imageUrl: null,
  reason: '16 GB de RAM, ideal para estudiar [1].',
  citations: [{ n: 1, documentId: 'd1', chunkId: 'c1', title: 'Manual', snippet: 'Diez horas.' }],
};

describe('ProductCard', () => {
  it('renders the hydrated price, never the LLM text, as money', () => {
    render(
      <ProductCard
        product={product}
        locale="es"
        productHref="/es/productos/mock-laptop-13"
        messages={messages}
        onAdd={() => Promise.resolve({ ok: true as const })}
      />,
    );
    // 129900 minor units USD in es locale → formatted by Intl, not from text.
    // (textContent matcher: Intl uses a non-breaking space the RTL
    // normalizer does not equate with a plain string.)
    const expectedPrice = formatPrice(129900, 'USD', 'es');
    expect(
      screen.getByText((_, element) => element?.textContent === expectedPrice),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mock Laptop 13/ })).toHaveAttribute(
      'href',
      '/es/productos/mock-laptop-13',
    );
    expect(screen.getByText('En stock')).toBeInTheDocument();
  });

  it('renders the reason as plain text with expandable citations', async () => {
    render(
      <ProductCard
        product={product}
        locale="es"
        productHref="/es/productos/mock-laptop-13"
        messages={messages}
        onAdd={() => Promise.resolve({ ok: true as const })}
      />,
    );
    expect(screen.getAllByText(/16 GB de RAM/).length).toBeGreaterThanOrEqual(1);
    // One inline [1] marker plus one source-list entry per citation.
    const firstCitation = screen.getAllByRole('button', { name: /Manual/ }).at(0);
    if (firstCitation !== undefined) {
      fireEvent.click(firstCitation);
    }
    expect(await screen.findByText('Diez horas.')).toBeInTheDocument();
  });

  it('adds to cart and confirms without touching prices', async () => {
    const onAdd = vi.fn(() => Promise.resolve({ ok: true as const }));
    render(
      <ProductCard
        product={product}
        locale="es"
        productHref="/x"
        messages={messages}
        onAdd={onAdd}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }));
    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith('prod-1');
    });
    expect(await screen.findByRole('button', { name: 'Agregado al carrito' })).toBeInTheDocument();
  });

  it('shows an inline error when add-to-cart fails', async () => {
    render(
      <ProductCard
        product={product}
        locale="es"
        productHref="/x"
        messages={messages}
        onAdd={() => Promise.resolve({ ok: false as const })}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(messages.addToCartError);
  });

  it('disables add-to-cart when out of stock', () => {
    render(
      <ProductCard
        product={{ ...product, inStock: false }}
        locale="es"
        productHref="/x"
        messages={messages}
        onAdd={() => Promise.resolve({ ok: true as const })}
      />,
    );
    expect(screen.getByText('Agotado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar al carrito' })).toBeDisabled();
  });

  it('shows the product image with the product name as alt', () => {
    render(
      <ProductCard
        product={{ ...product, imageUrl: 'https://placehold.co/600x400?text=RAM' }}
        locale="es"
        productHref="/x"
        messages={messages}
        onAdd={() => Promise.resolve({ ok: true as const })}
      />,
    );
    const image = screen.getByAltText('Mock Laptop 13');
    expect(image).toHaveAttribute('src', expect.stringContaining('placehold.co') as string);
  });

  it('falls back to the placeholder when the product has no image', () => {
    render(
      <ProductCard
        product={{ ...product, imageUrl: null }}
        locale="es"
        productHref="/x"
        messages={messages}
        onAdd={() => Promise.resolve({ ok: true as const })}
      />,
    );
    const image = screen.getByAltText('Mock Laptop 13');
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder') as string);
  });
});
