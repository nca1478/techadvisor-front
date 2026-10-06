import { createApiClient } from './client';
import { createAuthApi } from './auth';
import { createCartApi } from './cart';
import { createOrdersApi } from './orders';
import { createPaymentsApi } from './payments';

function mockFetchJson(body: unknown, status = 200) {
  return vi.fn((): Promise<Response> =>
    Promise.resolve(new Response(JSON.stringify(body), { status })),
  );
}

describe('typed API clients', () => {
  it('auth: posts credentials to /auth/login and returns the payload', async () => {
    const payload = {
      user: { id: 'u1', email: 'ada@example.com' },
      tokens: { accessToken: 'a', tokenType: 'Bearer', expiresIn: 900, refreshToken: 'r' },
    };
    const api = createAuthApi(
      createApiClient({ baseUrl: 'http://api.test/api/v1', fetchFn: mockFetchJson(payload) }),
    );
    await expect(
      api.login({ email: 'ada@example.com', password: 'correct-horse-battery-staple-42' }),
    ).resolves.toEqual(payload);
  });

  it('cart: builds item URLs with an encoded product id', async () => {
    const fetchFn = mockFetchJson({ id: 'cart-1', items: [] });
    const api = createCartApi(createApiClient({ baseUrl: 'http://api.test/api/v1', fetchFn }));
    await api.updateItem('prod/1', { qty: 2 });
    expect(fetchFn).toHaveBeenCalledWith(
      'http://api.test/api/v1/cart/items/prod%2F1',
      expect.objectContaining({ method: 'PATCH' }),
    );
    await api.removeItem('prod/1');
    expect(fetchFn).toHaveBeenCalledWith(
      'http://api.test/api/v1/cart/items/prod%2F1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('orders: posts the shipping address to /orders', async () => {
    const fetchFn = mockFetchJson({ id: 'order-1' }, 201);
    const api = createOrdersApi(createApiClient({ baseUrl: 'http://api.test/api/v1', fetchFn }));
    const shipping = { fullName: 'Ada', line1: 'Calle 1', city: 'Madrid', country: 'ES' };
    await api.createOrder({ shipping });
    expect(fetchFn).toHaveBeenCalledWith(
      'http://api.test/api/v1/orders',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ shipping }) }),
    );
  });

  it('payments: posts the order id to /payments/checkout', async () => {
    const fetchFn = mockFetchJson({ provider: 'stripe' }, 201);
    const api = createPaymentsApi(createApiClient({ baseUrl: 'http://api.test/api/v1', fetchFn }));
    await api.createCheckout({ orderId: 'order-1' });
    expect(fetchFn).toHaveBeenCalledWith(
      'http://api.test/api/v1/payments/checkout',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
