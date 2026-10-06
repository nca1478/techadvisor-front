import { type ApiClient, createApiClient } from './client';
import type { components } from './schema';

export type Cart = components['schemas']['CartResponseDto'];
export type CartItem = components['schemas']['CartItemDto'];
export type AddCartItem = components['schemas']['AddCartItemDto'];
export type UpdateCartItem = components['schemas']['UpdateCartItemDto'];

/**
 * Cart reads/writes against the generated OpenAPI contract. Guest identity
 * travels in the backend-issued httpOnly `sid` cookie, which the Next.js BFF
 * (`src/app/api/cart/*`) forwards transparently — the browser code below
 * never touches it. Totals (`totalAmount`, `lineTotalAmount`) are always
 * rendered from the server response, never computed locally.
 */
export function createCartApi(client: ApiClient = createApiClient()) {
  return {
    getCart: (init?: RequestInit) => client.get<Cart>('/cart', init),
    addItem: (body: AddCartItem, init?: RequestInit) =>
      client.post<Cart>('/cart/items', body, init),
    updateItem: (productId: string, body: UpdateCartItem, init?: RequestInit) =>
      client.patch<Cart>(`/cart/items/${encodeURIComponent(productId)}`, body, init),
    removeItem: (productId: string, init?: RequestInit) =>
      client.delete<Cart>(`/cart/items/${encodeURIComponent(productId)}`, init),
    merge: (init?: RequestInit) => client.post<Cart>('/cart/merge', undefined, init),
  };
}

export type CartApi = ReturnType<typeof createCartApi>;
