/**
 * Minimal contract-shaped mock of the backend API for Playwright e2e.
 *
 * Why a mock *server* instead of `page.route` interception
 * (see docs/decisions/0010-e2e-mock-estrategia.md): product listing/detail
 * pages fetch the API server-side during SSR, which browser request
 * interception cannot see. Pointing `API_BASE_URL` at this server covers
 * both SSR and the `/api/*` BFF proxies with a single fixture.
 *
 * Shapes mirror `src/lib/api/schema.d.ts` (generated OpenAPI contract).
 * Stateful in memory: one cart, one user, N orders. Payment confirmation is
 * simulated: `POST /payments/checkout` flips the order to `PAID`, standing
 * in for the Stripe webhook + `stripe listen` flow used against the real
 * backend (see README "E2E against the real backend").
 *
 * Usage: `MOCK_PORT=3002 E2E_WEB_URL=http://localhost:3000 node e2e/mock-backend.mjs`
 */

import http from 'node:http';

const PORT = Number(process.env['MOCK_PORT'] ?? 3002);
const WEB_URL = (process.env['E2E_WEB_URL'] ?? 'http://localhost:3000').replace(/\/+$/, '');
const BASE = '/api/v1';

const now = () => new Date().toISOString();

function productFixture(overrides) {
  return {
    id: 'prod-mock-laptop-13',
    sku: 'MOCK-LAPTOP-13',
    name: 'Mock Laptop 13',
    slug: 'mock-laptop-13',
    description:
      'A mock 13-inch laptop with 16 GB of RAM and a 512 GB SSD. Fixture used only for end-to-end tests.',
    brand: { id: 'brand-mock', name: 'MockBrand', slug: 'mockbrand' },
    category: {
      id: 'cat-laptops',
      name: 'Laptops',
      slug: 'laptops',
      parentSlug: null,
      specsSchema: [],
      locale: 'en',
    },
    priceAmount: 129900,
    currency: 'USD',
    specs: { ram_gb: 16, storage_gb: 512 },
    inStock: true,
    availableQuantity: 7,
    imageUrl: null,
    imageAlt: null,
    images: [],
    locale: 'en',
    createdAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

const PRODUCTS = [
  productFixture({}),
  productFixture({
    id: 'prod-mock-mouse-pro',
    sku: 'MOCK-MOUSE-PRO',
    name: 'Mock Mouse Pro',
    slug: 'mock-mouse-pro',
    description: 'A mock wireless mouse for end-to-end search fixtures.',
    priceAmount: 4990,
    specs: { dpi: 16000 },
  }),
];

const state = {
  user: null,
  cart: { id: 'cart-mock', currency: 'USD', locale: 'en', items: [], totalAmount: 0, itemCount: 0 },
  orders: [],
  orderSeq: 0,
};

function uniformError(statusCode, code, message) {
  return { status: statusCode, body: { statusCode, code, message } };
}

function toCartItem(product, qty) {
  return {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: null,
    unitPriceAmount: product.priceAmount,
    qty,
    lineTotalAmount: product.priceAmount * qty,
    inStock: product.inStock,
    sufficientStock: true,
    availableQuantity: product.availableQuantity,
  };
}

function recomputeCart() {
  const items = state.cart.items;
  state.cart.totalAmount = items.reduce((sum, item) => sum + item.lineTotalAmount, 0);
  state.cart.itemCount = items.reduce((sum, item) => sum + item.qty, 0);
}

function mockUser(email, name) {
  return {
    id: 'user-mock-1',
    email,
    name: name ?? null,
    role: 'CUSTOMER',
    createdAt: '2026-10-06T00:00:00.000Z',
    updatedAt: now(),
  };
}

function tokenPair() {
  return {
    accessToken: 'mock-access-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    refreshToken: 'mock-refresh-token',
  };
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(null);
      }
    });
  });
}

function send(res, status, body, extraHeaders = {}) {
  const payload = body === null ? '' : JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json', ...extraHeaders });
  res.end(payload);
}

async function handler(req, res) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (!url.pathname.startsWith(BASE)) {
    send(res, 404, uniformError(404, 'NOT_FOUND', 'Not found').body);
    return;
  }
  const path = url.pathname.slice(BASE.length);
  const method = (req.method ?? 'GET').toUpperCase();
  const query = url.searchParams;
  const body = method === 'GET' || method === 'HEAD' ? {} : await readJsonBody(req);
  if (body === null) {
    const err = uniformError(400, 'BAD_REQUEST', 'Invalid JSON body');
    send(res, err.status, err.body);
    return;
  }

  // Public config
  if (method === 'GET' && path === '/config/public') {
    send(res, 200, {
      baseCurrency: 'USD',
      supportedCurrencies: ['USD', 'EUR'],
      defaultLocale: 'en',
      supportedLocales: ['en', 'es'],
    });
    return;
  }

  if (method === 'GET' && path === '/health') {
    send(res, 200, { status: 'ok', db: 'up' });
    return;
  }

  // Catalog
  if (method === 'GET' && path === '/catalog/products') {
    const q = (query.get('q') ?? '').trim().toLowerCase();
    const category = query.get('category') ?? '';
    const brand = query.get('brand') ?? '';
    const locale = query.get('locale') ?? 'en';
    const page = Math.max(1, Number.parseInt(query.get('page') ?? '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(query.get('limit') ?? '12', 10) || 12));
    let data = PRODUCTS.filter((product) => {
      if (q && !`${product.name} ${product.description}`.toLowerCase().includes(q)) return false;
      if (category && product.category.slug !== category) return false;
      if (brand && product.brand.slug !== brand) return false;
      return true;
    }).map((product) => ({ ...product, locale }));
    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    data = data.slice((page - 1) * limit, page * limit);
    send(res, 200, {
      data,
      meta: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    });
    return;
  }

  const detailMatch = path.match(/^\/catalog\/products\/([^/]+)$/);
  if (method === 'GET' && detailMatch) {
    const product = PRODUCTS.find((candidate) => candidate.slug === detailMatch[1]);
    if (!product) {
      const err = uniformError(404, 'NOT_FOUND', 'Product not found');
      send(res, err.status, err.body);
      return;
    }
    send(res, 200, { ...product, locale: query.get('locale') ?? 'en' });
    return;
  }

  if (method === 'GET' && path === '/catalog/categories') {
    const locale = query.get('locale') ?? 'en';
    send(res, 200, [
      {
        id: 'cat-laptops',
        name: 'Laptops',
        slug: 'laptops',
        parentSlug: null,
        specsSchema: [],
        locale,
      },
    ]);
    return;
  }

  if (method === 'GET' && path === '/catalog/brands') {
    send(res, 200, [{ id: 'brand-mock', name: 'MockBrand', slug: 'mockbrand' }]);
    return;
  }

  // Auth
  if (method === 'POST' && (path === '/auth/register' || path === '/auth/login')) {
    const email = typeof body.email === 'string' ? body.email : 'e2e@example.com';
    state.user = mockUser(email, typeof body.name === 'string' ? body.name : undefined);
    send(res, path === '/auth/register' ? 201 : 200, { user: state.user, tokens: tokenPair() });
    return;
  }

  if (method === 'POST' && path === '/auth/refresh') {
    if (!state.user) {
      const err = uniformError(401, 'UNAUTHORIZED', 'Invalid refresh token');
      send(res, err.status, err.body);
      return;
    }
    send(res, 200, { tokens: tokenPair() });
    return;
  }

  if (method === 'POST' && path === '/auth/logout') {
    send(res, 200, { ok: true });
    return;
  }

  if (method === 'GET' && path === '/users/me') {
    const authorization = req.headers['authorization'] ?? '';
    if (!authorization.startsWith('Bearer ') || !state.user) {
      const err = uniformError(401, 'UNAUTHORIZED', 'Missing authentication');
      send(res, err.status, err.body);
      return;
    }
    send(res, 200, state.user);
    return;
  }

  // Cart
  if (method === 'GET' && path === '/cart') {
    send(res, 200, state.cart);
    return;
  }

  if (method === 'POST' && path === '/cart/items') {
    const product = PRODUCTS.find((candidate) => candidate.id === body.productId);
    if (!product) {
      const err = uniformError(404, 'NOT_FOUND', 'Product not found');
      send(res, err.status, err.body);
      return;
    }
    const qty = typeof body.qty === 'number' && body.qty > 0 ? Math.floor(body.qty) : 1;
    const existing = state.cart.items.find((item) => item.productId === product.id);
    if (existing) {
      existing.qty += qty;
      existing.lineTotalAmount = existing.unitPriceAmount * existing.qty;
    } else {
      state.cart.items.push(toCartItem(product, qty));
    }
    recomputeCart();
    send(res, 200, state.cart);
    return;
  }

  const cartItemMatch = path.match(/^\/cart\/items\/([^/]+)$/);
  if (cartItemMatch && (method === 'PATCH' || method === 'DELETE')) {
    const productId = decodeURIComponent(cartItemMatch[1]);
    if (method === 'DELETE') {
      state.cart.items = state.cart.items.filter((item) => item.productId !== productId);
    } else {
      const qty = typeof body.qty === 'number' ? Math.floor(body.qty) : NaN;
      if (!Number.isInteger(qty) || qty < 0) {
        const err = uniformError(400, 'BAD_REQUEST', 'Invalid quantity');
        send(res, err.status, err.body);
        return;
      }
      if (qty === 0) {
        state.cart.items = state.cart.items.filter((item) => item.productId !== productId);
      } else {
        const line = state.cart.items.find((item) => item.productId === productId);
        if (!line) {
          const err = uniformError(404, 'NOT_FOUND', 'Cart line not found');
          send(res, err.status, err.body);
          return;
        }
        line.qty = qty;
        line.lineTotalAmount = line.unitPriceAmount * qty;
      }
    }
    recomputeCart();
    send(res, 200, state.cart);
    return;
  }

  if (method === 'POST' && path === '/cart/merge') {
    send(res, 200, state.cart);
    return;
  }

  // Orders
  if (method === 'POST' && path === '/orders') {
    if (state.cart.items.length === 0) {
      const err = uniformError(400, 'BAD_REQUEST', 'Cart is empty');
      send(res, err.status, err.body);
      return;
    }
    state.orderSeq += 1;
    const order = {
      id: `order-mock-${state.orderSeq}`,
      status: 'PENDING_PAYMENT',
      currency: state.cart.currency,
      totalAmount: state.cart.totalAmount,
      itemCount: state.cart.itemCount,
      shipping: body.shipping ?? {},
      items: state.cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        qty: item.qty,
        unitPriceAmount: item.unitPriceAmount,
        lineTotalAmount: item.lineTotalAmount,
      })),
      createdAt: now(),
      updatedAt: now(),
    };
    state.orders.push(order);
    state.cart.items = [];
    recomputeCart();
    send(res, 201, order);
    return;
  }

  if (method === 'GET' && path === '/orders') {
    send(res, 200, [...state.orders].reverse());
    return;
  }

  const orderMatch = path.match(/^\/orders\/([^/]+)$/);
  if (method === 'GET' && orderMatch) {
    const order = state.orders.find((candidate) => candidate.id === orderMatch[1]);
    if (!order) {
      const err = uniformError(404, 'NOT_FOUND', 'Order not found');
      send(res, err.status, err.body);
      return;
    }
    send(res, 200, order);
    return;
  }

  const cancelMatch = path.match(/^\/orders\/([^/]+)\/cancel$/);
  if (method === 'POST' && cancelMatch) {
    const order = state.orders.find((candidate) => candidate.id === cancelMatch[1]);
    if (!order) {
      const err = uniformError(404, 'NOT_FOUND', 'Order not found');
      send(res, err.status, err.body);
      return;
    }
    order.status = 'CANCELLED';
    order.updatedAt = now();
    send(res, 200, order);
    return;
  }

  // Payments — checkout flips the order to PAID, simulating the Stripe
  // webhook confirmation that the real backend applies asynchronously.
  if (method === 'POST' && path === '/payments/checkout') {
    const order = state.orders.find((candidate) => candidate.id === body.orderId);
    if (!order) {
      const err = uniformError(404, 'NOT_FOUND', 'Order not found');
      send(res, err.status, err.body);
      return;
    }
    order.status = 'PAID';
    order.updatedAt = now();
    send(res, 201, {
      provider: 'stripe',
      sessionId: 'cs_test_mock',
      checkoutUrl: `${WEB_URL}/en/checkout/exito?orderId=${encodeURIComponent(order.id)}`,
    });
    return;
  }

  // Advisor (fake adapters): cited answer, abstention, rate limit, feedback stub.
  if (method === 'POST' && path === '/advisor/product-qa') {
    const product = PRODUCTS.find((candidate) => candidate.id === body.productId);
    if (!product) {
      const err = uniformError(404, 'NOT_FOUND', 'Product not found');
      send(res, err.status, err.body);
      return;
    }
    const question = typeof body.question === 'string' ? body.question : '';
    if (question.length === 0 || question.length > 1000) {
      const err = uniformError(400, 'BAD_REQUEST', 'Invalid question');
      send(res, err.status, err.body);
      return;
    }
    if (question.includes('rate-limit-probe')) {
      const err = uniformError(429, 'TOO_MANY_REQUESTS', 'Slow down');
      send(res, err.status, err.body, { 'retry-after': '1' });
      return;
    }
    if (question.includes('no-evidence-probe')) {
      send(res, 200, {
        answer: 'No tengo esa información.',
        citations: [],
        abstained: true,
      });
      return;
    }
    send(res, 200, {
      answer: `El ${product.name} dura hasta 10 horas de batería [1].`,
      citations: [
        {
          n: 1,
          documentId: 'doc-mock-manual',
          chunkId: 'chunk-mock-1',
          title: `${product.name} manual`,
          snippet: 'La batería dura hasta 10 horas en uso mixto…',
        },
      ],
      abstained: false,
    });
    return;
  }

  if (method === 'POST' && path === '/advisor/feedback') {
    send(res, 200, { ok: true });
    return;
  }

  const err = uniformError(404, 'NOT_FOUND', `Mock has no handler for ${method} ${path}`);
  send(res, err.status, err.body);
}

const server = http.createServer((req, res) => {
  handler(req, res).catch(() => {
    if (!res.headersSent) {
      const err = uniformError(500, 'INTERNAL_ERROR', 'Mock handler failed');
      send(res, err.status, err.body);
    }
  });
});

server.listen(PORT, () => {
  console.log(`mock backend listening on http://localhost:${String(PORT)}${BASE}`);
});
