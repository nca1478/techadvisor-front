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
 * Stateful in memory: owner-scoped carts (guest `sid`, minted here when
 * absent, or Bearer token), token-scoped users (every login mints a unique
 * pair, so parallel workers never share a role), N orders. Owner scoping keeps
 * parallel Playwright workers (`fullyParallel`) from seeing each other's
 * lines (each worker has its own browser context and cookies). Payment
 * confirmation is
 * simulated: `POST /payments/checkout` flips the order to `PAID`, standing
 * in for the Stripe webhook + `stripe listen` flow used against the real
 * backend (see README "E2E against the real backend").
 *
 * Back-office categories (`/admin/categories*`, ADMIN role only): emails
 * starting with `e2e-admin-` register as ADMIN, everything else as
 * CUSTOMER. Stateful list/create/detail/update/delete with the real
 * guards (unique slug, no self-parent, 409 while subcategories exist).
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

const BOARD_DDR5_ID = '22222222-2222-4222-8222-222222222222';
const RAM_DDR4_ID = '33333333-3333-4333-8333-333333333333';
const CPU_AM4_ID = '44444444-4444-4444-8444-444444444444';
const BOARD_LGA1700_ID = '55555555-5555-4555-8555-555555555555';
const BOARD_QTY_ID = '66666666-6666-4666-8666-666666666666';
const SATA_QTY_ID = '77777777-7777-4777-8777-777777777777';
const RAM_QTY_ID = '88888888-8888-4888-8888-888888888888';
const M2_QTY_ID = '99999999-9999-4999-8999-999999999999';

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

const COMPAT_FIXTURES = [
  productFixture({
    id: BOARD_DDR5_ID,
    sku: 'MOCK-BOARD-DDR5',
    name: 'Mock Board DDR5',
    slug: 'mock-board-ddr5',
    description:
      'A mock AM5 motherboard that only accepts DDR5 memory. Fixture for compatibility e2e.',
    priceAmount: 18900,
    specs: { socket: 'AM5', ram_type: 'DDR5', form_factor: 'ATX' },
    category: {
      id: 'cat-boards',
      name: 'Motherboards',
      slug: 'motherboards',
      parentSlug: null,
      specsSchema: [],
      locale: 'en',
    },
  }),
  productFixture({
    id: RAM_DDR4_ID,
    sku: 'MOCK-RAM-DDR4',
    name: 'Mock RAM DDR4',
    slug: 'mock-ram-ddr4',
    description: 'A mock DDR4 memory kit. Fixture for compatibility e2e (mismatches DDR5 boards).',
    priceAmount: 4900,
    specs: { ram_type: 'DDR4', ram_gb: 16, speed_mt_s: 3200 },
    category: {
      id: 'cat-ram',
      name: 'Memory',
      slug: 'memory',
      parentSlug: null,
      specsSchema: [],
      locale: 'en',
    },
  }),
  productFixture({
    id: CPU_AM4_ID,
    sku: 'MOCK-CPU-AM4',
    name: 'Mock CPU AM4',
    slug: 'mock-cpu-am4',
    description: 'A mock AM4 processor. Fixture for compatibility e2e (mismatches LGA1700 boards).',
    priceAmount: 12900,
    specs: { socket: 'AM4', cores: 6, threads: 12 },
    category: {
      id: 'cat-cpu',
      name: 'Processors',
      slug: 'processors',
      parentSlug: null,
      specsSchema: [],
      locale: 'en',
    },
  }),
  productFixture({
    id: BOARD_LGA1700_ID,
    sku: 'MOCK-BOARD-LGA1700',
    name: 'Mock Board LGA1700',
    slug: 'mock-board-lga1700',
    description: 'A mock LGA1700 motherboard. Fixture for compatibility e2e (mismatches AM4 CPUs).',
    priceAmount: 15900,
    specs: { socket: 'LGA1700', ram_type: 'DDR4', form_factor: 'mATX' },
    category: {
      id: 'cat-boards',
      name: 'Motherboards',
      slug: 'motherboards',
      parentSlug: null,
      specsSchema: [],
      locale: 'en',
    },
  }),
  productFixture({
    id: BOARD_QTY_ID,
    sku: 'MOCK-BOARD-QTY',
    name: 'Mock Board Qty',
    slug: 'mock-board-qty',
    description:
      'A mock AM5/DDR5 board with 2 SATA ports, 1 M.2 slot, 2 RAM slots and 32GB max. Fixture for quantity-aware compatibility e2e.',
    priceAmount: 19900,
    specs: {
      socket: 'AM5',
      ram_type: 'DDR5',
      form_factor: 'ATX',
      ram_slots: 2,
      max_ram_gb: 32,
      max_ram_speed_mt_s: 6400,
      m2_slots: 1,
      sata_ports: 2,
    },
    category: {
      id: 'cat-boards',
      name: 'Motherboards',
      slug: 'motherboards',
      parentSlug: null,
      specsSchema: [],
      locale: 'en',
    },
  }),
  productFixture({
    id: SATA_QTY_ID,
    sku: 'MOCK-SATA-QTY',
    name: 'Mock SATA Drive',
    slug: 'mock-sata-drive',
    description: 'A mock SATA drive. Fixture for quantity-aware compatibility e2e.',
    priceAmount: 5900,
    specs: { storage_type: 'SSD', form_factor: '2.5 inch', storage_gb: 1024 },
    category: {
      id: 'cat-storage',
      name: 'Storage',
      slug: 'storage',
      parentSlug: null,
      specsSchema: [],
      locale: 'en',
    },
  }),
  productFixture({
    id: M2_QTY_ID,
    sku: 'MOCK-M2-QTY',
    name: 'Mock M2 Drive',
    slug: 'mock-m2-drive',
    description: 'A mock NVMe M.2 drive. Fixture for quantity-aware compatibility e2e.',
    priceAmount: 8900,
    specs: { storage_type: 'NVME', form_factor: 'M.2 2280', storage_gb: 1024 },
    category: {
      id: 'cat-storage',
      name: 'Storage',
      slug: 'storage',
      parentSlug: null,
      specsSchema: [],
      locale: 'en',
    },
  }),
  productFixture({
    id: RAM_QTY_ID,
    sku: 'MOCK-RAM-QTY',
    name: 'Mock RAM Qty DDR5',
    slug: 'mock-ram-qty',
    description: 'A mock DDR5 16GB kit (1 module). Fixture for quantity-aware compatibility e2e.',
    priceAmount: 6900,
    specs: { ram_type: 'DDR5', ram_gb: 16, speed_mt_s: 5600, modules: 1 },
    category: {
      id: 'cat-ram',
      name: 'Memory',
      slug: 'memory',
      parentSlug: null,
      specsSchema: [],
      locale: 'en',
    },
  }),
];

// Listing fixtures stay minimal (existing tests assert on them); detail,
// cart and compatibility/compare resolve the full catalog.
const ALL_PRODUCTS = [...PRODUCTS, ...COMPAT_FIXTURES];

const state = {
  user: null,
  usersByEmail: {},
  accessTokens: {},
  refreshTokens: {},
  tokenSeq: 0,
  carts: {},
  cartSeq: 0,
  orders: [],
  orderSeq: 0,
  sessions: [],
  sessionSeq: 0,
  sidSeq: 0,
  adminCategories: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Mock Root',
      slug: 'mock-root',
      parentId: null,
      imageUrl: null,
      imageAlt: null,
      showInHome: true,
      translations: [],
    },
  ],
  categorySeq: 0,
};

// Advisor session ownership (mirrors the real backend, ADR 0029): a session
// belongs to the Bearer-authenticated user or to the anonymous guest holding
// the `sid` cookie. Unknown ids and foreign sessions 404 identically (never
// revealing ownership); listing requires authentication (401 otherwise).
// Without this, contexts would adopt each other's sessions through the
// history list and e2e tests would share conversations.
function parseCookies(req) {
  const header = req.headers['cookie'] ?? '';
  const out = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    out[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return out;
}

function bearerToken(req) {
  const auth = req.headers['authorization'] ?? '';
  return auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
}

function callerOwnerKey(req) {
  const token = bearerToken(req);
  if (token) return `user:${token}`;
  const sid = parseCookies(req).sid;
  return sid ? `anon:${sid}` : null;
}

function publicSession(session) {
  // Owner never leaves the server (like the real backend's DTOs).
  return {
    id: session.id,
    messageCount: session.messages.length,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

function ownedSessionOrNull(req, id) {
  const owner = callerOwnerKey(req);
  if (!owner) return null;
  const session = state.sessions.find((candidate) => candidate.id === id);
  if (!session || session.owner !== owner) return null;
  return session;
}

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

function recomputeCart(cart) {
  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.lineTotalAmount, 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.qty, 0);
}

function newCart() {
  state.cartSeq += 1;
  return {
    id: `cart-mock-${state.cartSeq}`,
    currency: 'USD',
    locale: 'en',
    items: [],
    totalAmount: 0,
    itemCount: 0,
  };
}

/**
 * Owner-scoped carts (mirrors the real backend's guest `sid` + user carts).
 * Playwright runs tests in parallel workers with isolated browser contexts
 * (`fullyParallel`), so cookie isolation keeps every test's cart separate:
 * authenticated callers scope by Bearer token, guests by `sid` (minted here
 * when absent, forwarded to the browser via `set-cookie`).
 */
function cartFor(req) {
  const token = bearerToken(req);
  if (token) {
    const key = `user:${token}`;
    if (!state.carts[key]) state.carts[key] = newCart();
    return { cart: state.carts[key], setCookie: null };
  }
  let sid = parseCookies(req).sid;
  let setCookie = null;
  if (!sid) {
    state.sidSeq += 1;
    sid = `mock-sid-${state.sidSeq}`;
    setCookie = `sid=${sid}; Path=/; HttpOnly`;
  }
  const key = `anon:${sid}`;
  if (!state.carts[key]) state.carts[key] = newCart();
  return { cart: state.carts[key], setCookie };
}

function cartHeaders(slot) {
  return slot.setCookie ? { 'set-cookie': slot.setCookie } : {};
}

function mockUser(email, name) {
  return {
    id: `user-mock-${email}`,
    email,
    name: name ?? null,
    // Back-office specs register `e2e-admin-*@example.com` to get an ADMIN
    // session (the admin layout redirects CUSTOMER to the store home).
    role: email.startsWith('e2e-admin-') ? 'ADMIN' : 'CUSTOMER',
    createdAt: '2026-10-06T00:00:00.000Z',
    updatedAt: now(),
  };
}

/**
 * Unique token pair per login/registration, mapped back to the user email.
 * Parallel workers share this process but register different emails, so a
 * global `state.user` would let them clobber each other's role — the map
 * keeps every context's session (CUSTOMER vs ADMIN) isolated.
 */
function tokenPair(email) {
  state.tokenSeq += 1;
  const pair = {
    accessToken: `mock-access-token-${state.tokenSeq}`,
    tokenType: 'Bearer',
    expiresIn: 3600,
    refreshToken: `mock-refresh-token-${state.tokenSeq}`,
  };
  state.accessTokens[pair.accessToken] = email;
  state.refreshTokens[pair.refreshToken] = email;
  return pair;
}

function userForAccessToken(req) {
  const email = state.accessTokens[bearerToken(req)];
  if (!email) return null;
  return state.usersByEmail[email] ?? null;
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
    const product = ALL_PRODUCTS.find((candidate) => candidate.slug === detailMatch[1]);
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
        imageUrl: null,
        imageAlt: null,
        showInHome: true,
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

  // Auth (token-scoped users: parallel workers never share a role)
  if (method === 'POST' && (path === '/auth/register' || path === '/auth/login')) {
    const email = typeof body.email === 'string' ? body.email : 'e2e@example.com';
    const user = mockUser(email, typeof body.name === 'string' ? body.name : undefined);
    state.usersByEmail[email] = user;
    state.user = user;
    send(res, path === '/auth/register' ? 201 : 200, { user, tokens: tokenPair(email) });
    return;
  }

  if (method === 'POST' && path === '/auth/refresh') {
    const email =
      typeof body.refreshToken === 'string' ? state.refreshTokens[body.refreshToken] : undefined;
    if (!email || !state.usersByEmail[email]) {
      const err = uniformError(401, 'UNAUTHORIZED', 'Invalid refresh token');
      send(res, err.status, err.body);
      return;
    }
    send(res, 200, { tokens: tokenPair(email) });
    return;
  }

  if (method === 'POST' && path === '/auth/logout') {
    send(res, 200, { ok: true });
    return;
  }

  if (method === 'GET' && path === '/users/me') {
    const user = userForAccessToken(req);
    if (!user) {
      const err = uniformError(401, 'UNAUTHORIZED', 'Missing authentication');
      send(res, err.status, err.body);
      return;
    }
    send(res, 200, user);
    return;
  }

  // Back-office categories (stateful, mirrors `AdminCategoryDto` + the
  // real guards: ADMIN role, unique slug, no self-parent, no delete while
  // subcategories exist). Used by `e2e/admin-categories.spec.ts`.
  function adminCaller() {
    const user = userForAccessToken(req);
    if (!user) return uniformError(401, 'UNAUTHORIZED', 'Missing authentication');
    if (user.role !== 'ADMIN') return uniformError(403, 'FORBIDDEN', 'Admin role required');
    return null;
  }

  if (path === '/admin/categories' && (method === 'GET' || method === 'POST')) {
    const denied = adminCaller();
    if (denied) {
      send(res, denied.status, denied.body);
      return;
    }
    if (method === 'GET') {
      send(res, 200, state.adminCategories);
      return;
    }
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    if (!name || !slug) {
      const err = uniformError(400, 'BAD_REQUEST', 'name and slug are required');
      send(res, err.status, err.body);
      return;
    }
    if (state.adminCategories.some((category) => category.slug === slug)) {
      const err = uniformError(409, 'CONFLICT', 'A record with the same slug already exists');
      send(res, err.status, err.body);
      return;
    }
    if (typeof body.parentId === 'string' && body.parentId) {
      const parent = state.adminCategories.find((category) => category.id === body.parentId);
      if (!parent) {
        const err = uniformError(404, 'NOT_FOUND', 'Category not found');
        send(res, err.status, err.body);
        return;
      }
    }
    state.categorySeq += 1;
    // UUID-shaped ids: the frontend pre-validates `parentId` as a UUID,
    // mirroring the real backend contract.
    const created = {
      id: `22222222-2222-4222-8222-${String(state.categorySeq).padStart(12, '0')}`,
      name,
      slug,
      parentId: typeof body.parentId === 'string' && body.parentId ? body.parentId : null,
      imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : null,
      imageAlt: typeof body.imageAlt === 'string' ? body.imageAlt : null,
      showInHome: typeof body.showInHome === 'boolean' ? body.showInHome : true,
      translations: Array.isArray(body.translations) ? body.translations : [],
    };
    state.adminCategories.push(created);
    send(res, 201, created);
    return;
  }

  const adminCategoryMatch = path.match(/^\/admin\/categories\/([^/]+)$/);
  if (adminCategoryMatch && (method === 'GET' || method === 'PATCH' || method === 'DELETE')) {
    const denied = adminCaller();
    if (denied) {
      send(res, denied.status, denied.body);
      return;
    }
    const id = decodeURIComponent(adminCategoryMatch[1]);
    const category = state.adminCategories.find((candidate) => candidate.id === id);
    if (!category) {
      const err = uniformError(404, 'NOT_FOUND', 'Category not found');
      send(res, err.status, err.body);
      return;
    }
    if (method === 'GET') {
      send(res, 200, category);
      return;
    }
    if (method === 'DELETE') {
      const children = state.adminCategories.filter(
        (candidate) => candidate.parentId === id,
      ).length;
      if (children > 0) {
        const err = uniformError(
          409,
          'CONFLICT',
          'Category cannot be deleted while it has subcategories or products',
        );
        send(res, err.status, err.body);
        return;
      }
      state.adminCategories.splice(state.adminCategories.indexOf(category), 1);
      send(res, 204, null);
      return;
    }
    if (typeof body.slug === 'string' && body.slug.trim()) {
      const taken = state.adminCategories.some(
        (candidate) => candidate.id !== id && candidate.slug === body.slug.trim(),
      );
      if (taken) {
        const err = uniformError(409, 'CONFLICT', 'A record with the same slug already exists');
        send(res, err.status, err.body);
        return;
      }
      category.slug = body.slug.trim();
    }
    if (typeof body.name === 'string' && body.name.trim()) {
      category.name = body.name.trim();
    }
    if (body.parentId !== undefined) {
      if (body.parentId === id) {
        const err = uniformError(400, 'BAD_REQUEST', 'A category cannot be its own parent');
        send(res, err.status, err.body);
        return;
      }
      if (body.parentId !== null) {
        const parent = state.adminCategories.find((candidate) => candidate.id === body.parentId);
        if (!parent) {
          const err = uniformError(404, 'NOT_FOUND', 'Category not found');
          send(res, err.status, err.body);
          return;
        }
      }
      category.parentId = body.parentId;
    }
    if (body.translations !== undefined) {
      category.translations = Array.isArray(body.translations) ? body.translations : [];
    }
    if (body.imageUrl !== undefined) {
      category.imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl : null;
    }
    if (body.imageAlt !== undefined) {
      category.imageAlt = typeof body.imageAlt === 'string' ? body.imageAlt : null;
    }
    if (body.showInHome !== undefined) {
      category.showInHome = body.showInHome === false ? false : true;
    }
    send(res, 200, category);
    return;
  }

  // Cart (owner-scoped, see `cartFor`)
  if (method === 'GET' && path === '/cart') {
    const slot = cartFor(req);
    send(res, 200, slot.cart, cartHeaders(slot));
    return;
  }

  if (method === 'POST' && path === '/cart/items') {
    const slot = cartFor(req);
    const cart = slot.cart;
    const product = ALL_PRODUCTS.find((candidate) => candidate.id === body.productId);
    if (!product) {
      const err = uniformError(404, 'NOT_FOUND', 'Product not found');
      send(res, err.status, err.body);
      return;
    }
    const qty = typeof body.qty === 'number' && body.qty > 0 ? Math.floor(body.qty) : 1;
    const existing = cart.items.find((item) => item.productId === product.id);
    if (existing) {
      existing.qty += qty;
      existing.lineTotalAmount = existing.unitPriceAmount * existing.qty;
    } else {
      cart.items.push(toCartItem(product, qty));
    }
    recomputeCart(cart);
    send(res, 200, cart, cartHeaders(slot));
    return;
  }

  const cartItemMatch = path.match(/^\/cart\/items\/([^/]+)$/);
  if (cartItemMatch && (method === 'PATCH' || method === 'DELETE')) {
    const slot = cartFor(req);
    const cart = slot.cart;
    const productId = decodeURIComponent(cartItemMatch[1]);
    if (method === 'DELETE') {
      cart.items = cart.items.filter((item) => item.productId !== productId);
    } else {
      const qty = typeof body.qty === 'number' ? Math.floor(body.qty) : NaN;
      if (!Number.isInteger(qty) || qty < 0) {
        const err = uniformError(400, 'BAD_REQUEST', 'Invalid quantity');
        send(res, err.status, err.body);
        return;
      }
      if (qty === 0) {
        cart.items = cart.items.filter((item) => item.productId !== productId);
      } else {
        const line = cart.items.find((item) => item.productId === productId);
        if (!line) {
          const err = uniformError(404, 'NOT_FOUND', 'Cart line not found');
          send(res, err.status, err.body);
          return;
        }
        line.qty = qty;
        line.lineTotalAmount = line.unitPriceAmount * qty;
      }
    }
    recomputeCart(cart);
    send(res, 200, cart, cartHeaders(slot));
    return;
  }

  if (method === 'POST' && path === '/cart/merge') {
    // Move guest lines into the user cart (mirrors the real backend).
    const token = bearerToken(req);
    const sid = parseCookies(req).sid;
    if (token && sid) {
      const guest = state.carts[`anon:${sid}`];
      if (guest && guest.items.length > 0) {
        const userKey = `user:${token}`;
        if (!state.carts[userKey]) state.carts[userKey] = newCart();
        const userCart = state.carts[userKey];
        for (const item of guest.items) {
          const existing = userCart.items.find((line) => line.productId === item.productId);
          if (existing) {
            existing.qty += item.qty;
            existing.lineTotalAmount = existing.unitPriceAmount * existing.qty;
          } else {
            userCart.items.push({ ...item });
          }
        }
        recomputeCart(userCart);
        guest.items = [];
        recomputeCart(guest);
      }
    }
    const slot = cartFor(req);
    send(res, 200, slot.cart, cartHeaders(slot));
    return;
  }

  // Orders
  if (method === 'POST' && path === '/orders') {
    const slot = cartFor(req);
    const cart = slot.cart;
    if (cart.items.length === 0) {
      const err = uniformError(400, 'BAD_REQUEST', 'Cart is empty');
      send(res, err.status, err.body);
      return;
    }
    state.orderSeq += 1;
    const order = {
      id: `order-mock-${state.orderSeq}`,
      status: 'PENDING_PAYMENT',
      currency: cart.currency,
      totalAmount: cart.totalAmount,
      itemCount: cart.itemCount,
      shipping: body.shipping ?? {},
      items: cart.items.map((item) => ({
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
    cart.items = [];
    recomputeCart(cart);
    send(res, 201, order, cartHeaders(slot));
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

  // Compatibility (deterministic mock of the rule engine): DDR4 memory in a
  // DDR5 board is an error; an AM4 CPU in an LGA1700 board is an error.
  // Quantity-aware: `items` (productId+qty) are expanded like the real
  // backend; legacy `productIds` count as qty 1. The `BOARD_QTY` board has
  // 2 SATA ports, 1 M.2 slot, 2 RAM slots and 32GB max — exceeding any of
  // those with qty must raise an error, mirroring the real engine.
  function mockCompatibilityCheck(qtyById) {
    const issues = [];
    const ids = [...qtyById.keys()];
    const has = (id) => ids.includes(id);
    const qty = (id) => qtyById.get(id) ?? 0;
    if (has(RAM_DDR4_ID) && has(BOARD_DDR5_ID)) {
      issues.push({
        rule: 'ram-type',
        severity: 'error',
        productIds: [RAM_DDR4_ID, BOARD_DDR5_ID],
        messageKey: 'ram-type.mismatch',
        message:
          'Memory "Mock RAM DDR4" is DDR4, but board "Mock Board DDR5" only accepts DDR5. They are not compatible.',
      });
    }
    if (has(CPU_AM4_ID) && has(BOARD_LGA1700_ID)) {
      issues.push({
        rule: 'cpu-socket',
        severity: 'error',
        productIds: [CPU_AM4_ID, BOARD_LGA1700_ID],
        messageKey: 'cpu-socket.mismatch',
        message:
          'Processor "Mock CPU AM4" uses socket AM4, but board "Mock Board LGA1700" uses socket LGA1700. They are not compatible.',
      });
    }
    if (has(BOARD_QTY_ID) && has(SATA_QTY_ID) && qty(SATA_QTY_ID) > 2) {
      issues.push({
        rule: 'storage-interface',
        severity: 'error',
        productIds: [SATA_QTY_ID, BOARD_QTY_ID],
        messageKey: 'storage-interface.unsupported',
        message: `Drive "Mock SATA Drive" needs a SATA connection, but board "Mock Board Qty" has no free connectors of that type left.`,
      });
    }
    if (has(BOARD_QTY_ID) && has(M2_QTY_ID) && qty(M2_QTY_ID) > 1) {
      issues.push({
        rule: 'storage-interface',
        severity: 'error',
        productIds: [M2_QTY_ID, BOARD_QTY_ID],
        messageKey: 'storage-interface.unsupported',
        message: `Drive "Mock M2 Drive" needs a M.2 connection, but board "Mock Board Qty" has no free connectors of that type left.`,
      });
    }
    if (has(BOARD_QTY_ID) && has(RAM_QTY_ID)) {
      const totalGb = 16 * qty(RAM_QTY_ID);
      const needSlots = 1 * qty(RAM_QTY_ID);
      if (totalGb > 32) {
        issues.push({
          rule: 'ram-capacity',
          severity: 'error',
          productIds: [BOARD_QTY_ID, RAM_QTY_ID],
          messageKey: 'ram-capacity.exceeded',
          message: `Total memory (${String(totalGb)} GB) exceeds the maximum of board "Mock Board Qty" (32 GB).`,
        });
      }
      if (needSlots > 2) {
        issues.push({
          rule: 'ram-slots',
          severity: 'error',
          productIds: [BOARD_QTY_ID, RAM_QTY_ID],
          messageKey: 'ram-slots.exceeded',
          message: `You need ${String(needSlots)} memory slots, but board "Mock Board Qty" only has 2 slots.`,
        });
      }
    }
    return { compatible: issues.length === 0, issues };
  }

  if (method === 'POST' && path === '/compatibility/check') {
    const qtyById = new Map();
    const legacyIds = Array.isArray(body.productIds) ? body.productIds : [];
    for (const id of legacyIds) {
      if (typeof id === 'string' && !qtyById.has(id)) qtyById.set(id, 1);
    }
    const items = Array.isArray(body.items) ? body.items : [];
    for (const item of items) {
      if (
        item &&
        typeof item.productId === 'string' &&
        Number.isInteger(item.qty) &&
        item.qty >= 1
      ) {
        qtyById.set(item.productId, item.qty);
      }
    }
    const ids = [...qtyById.keys()];
    const unknown = ids.filter((id) => !ALL_PRODUCTS.some((product) => product.id === id));
    if (unknown.length > 0) {
      const err = uniformError(404, 'NOT_FOUND', `Products not found: ${unknown.join(', ')}`);
      send(res, err.status, err.body);
      return;
    }
    if (ids.length === 0) {
      const err = uniformError(400, 'BAD_REQUEST', 'either productIds or items is required');
      send(res, err.status, err.body);
      return;
    }
    send(res, 200, mockCompatibilityCheck(qtyById));
    return;
  }

  // Compare (SQL table + cited summary mock): 2..3 known ids, price row with
  // the cheapest highlighted, plus the deterministic compatibility verdict.
  if (method === 'POST' && path === '/advisor/compare') {
    const ids = Array.isArray(body.productIds) ? [...new Set(body.productIds)] : [];
    if (ids.length < 2 || ids.length > 3) {
      const err = uniformError(400, 'BAD_REQUEST', 'productIds must contain 2 or 3 product ids');
      send(res, err.status, err.body);
      return;
    }
    const ordered = [];
    for (const id of ids) {
      const product = ALL_PRODUCTS.find((candidate) => candidate.id === id);
      if (!product) {
        const err = uniformError(404, 'NOT_FOUND', `Products not found: ${id}`);
        send(res, err.status, err.body);
        return;
      }
      ordered.push(product);
    }
    const sameCurrency = ordered.every((product) => product.currency === ordered[0].currency);
    const minPrice = Math.min(...ordered.map((product) => product.priceAmount));
    const table = [
      {
        key: 'price_amount',
        values: ordered.map((product) => product.priceAmount),
        best: sameCurrency
          ? ordered.flatMap((product, index) => (product.priceAmount === minPrice ? [index] : []))
          : [],
        direction: sameCurrency ? 'lower' : null,
      },
      {
        key: 'ram_gb',
        values: ordered.map((product) =>
          typeof product.specs.ram_gb === 'number' ? product.specs.ram_gb : null,
        ),
        best: [],
        direction: null,
      },
    ];
    const compatibility = mockCompatibilityCheck(new Map(ids.map((id) => [id, 1])));
    const first = ordered[0];
    const second = ordered[1];
    send(res, 200, {
      products: ordered.map((product) => ({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        priceAmount: product.priceAmount,
        currency: product.currency,
        specs: product.specs,
      })),
      table,
      compatibility,
      summary: `${first.name} costs less than ${second.name} [1].`,
      citations: [
        {
          n: 1,
          documentId: 'doc-mock-manual',
          chunkId: 'chunk-mock-1',
          title: `${first.name} manual`,
          snippet: 'Mock evidence fragment for the comparison…',
        },
      ],
    });
    return;
  }

  // Advisor (fake adapters): chat sessions, cited answer, abstention, rate limit, feedback stub.
  if (method === 'POST' && path === '/advisor/sessions') {
    state.sessionSeq += 1;
    let owner = callerOwnerKey(req);
    let extraHeaders = {};
    if (!owner) {
      state.sidSeq += 1;
      const sid = `mock-sid-${state.sidSeq}`;
      owner = `anon:${sid}`;
      extraHeaders = { 'set-cookie': `sid=${sid}; Path=/; HttpOnly` };
    }
    const session = {
      id: `session-mock-${state.sessionSeq}`,
      owner,
      createdAt: now(),
      updatedAt: now(),
      messages: [],
    };
    state.sessions.push(session);
    send(res, 201, publicSession(session), extraHeaders);
    return;
  }

  if (method === 'GET' && path === '/advisor/sessions') {
    if (!bearerToken(req)) {
      const err = uniformError(401, 'UNAUTHORIZED', 'Authentication required');
      send(res, err.status, err.body);
      return;
    }
    const owned = state.sessions.filter((candidate) => candidate.owner === callerOwnerKey(req));
    send(res, 200, [...owned].reverse().map(publicSession));
    return;
  }

  const sessionMatch = path.match(/^\/advisor\/sessions\/([^/]+)$/);
  if (sessionMatch && method === 'DELETE') {
    const session = ownedSessionOrNull(req, decodeURIComponent(sessionMatch[1]));
    if (!session) {
      const err = uniformError(404, 'NOT_FOUND', 'Unknown session');
      send(res, err.status, err.body);
      return;
    }
    state.sessions.splice(state.sessions.indexOf(session), 1);
    send(res, 204, null);
    return;
  }
  if (sessionMatch && method === 'GET') {
    const session = ownedSessionOrNull(req, decodeURIComponent(sessionMatch[1]));
    if (!session) {
      const err = uniformError(404, 'NOT_FOUND', 'Unknown session');
      send(res, err.status, err.body);
      return;
    }
    const rest = { ...session };
    delete rest.owner;
    send(res, 200, rest);
    return;
  }

  const recommendCitation = (product) => ({
    n: 1,
    documentId: 'doc-mock-manual',
    chunkId: 'chunk-mock-1',
    title: `${product.name} manual`,
    snippet: 'La batería dura hasta 10 horas en uso mixto…',
  });

  const recommendCard = (product) => ({
    productId: product.id,
    name: product.name,
    slug: product.slug,
    priceAmount: product.priceAmount,
    currency: 'USD',
    inStock: product.inStock,
    availableQuantity: product.availableQuantity,
    imageUrl: null,
    reason: `16 GB de RAM y SSD NVMe, ideal para estudiar [1].`,
    citations: [recommendCitation(product)],
  });

  // Conversational advisor (fake adapters): content-only bodies run the
  // buying flow (recommendation, clarification probe, rate-limit probe);
  // role+content bodies keep the legacy raw-append behavior.
  const messagesMatch = path.match(/^\/advisor\/sessions\/([^/]+)\/messages$/);
  if (messagesMatch && method === 'POST') {
    const session = ownedSessionOrNull(req, decodeURIComponent(messagesMatch[1]));
    if (!session) {
      const err = uniformError(404, 'NOT_FOUND', 'Unknown session');
      send(res, err.status, err.body);
      return;
    }
    const pushMessage = (role, content, citations, products) => {
      const message = {
        id: `msg-mock-${session.messages.length + 1}`,
        role,
        content,
        citations: citations ?? [],
        products: products ?? [],
        createdAt: now(),
      };
      session.messages.push(message);
      session.messageCount = session.messages.length;
      session.updatedAt = now();
      return message;
    };
    // Legacy shape: raw append, 201.
    if (typeof body.role === 'string') {
      const content = typeof body.content === 'string' ? body.content.trim() : '';
      if (content.length === 0) {
        const err = uniformError(400, 'BAD_REQUEST', 'Invalid message');
        send(res, err.status, err.body);
        return;
      }
      send(res, 201, pushMessage(body.role, content));
      return;
    }
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (content.length === 0) {
      const err = uniformError(400, 'BAD_REQUEST', 'Invalid message');
      send(res, err.status, err.body);
      return;
    }
    if (content.includes('rate-limit-probe')) {
      const err = uniformError(429, 'TOO_MANY_REQUESTS', 'Slow down');
      send(res, err.status, err.body, { 'retry-after': '1' });
      return;
    }
    pushMessage('USER', content);
    let answer;
    if (content.includes('clarify-probe')) {
      answer = {
        message: '¿Cuál es tu presupuesto máximo (y en qué moneda)?',
        products: [],
        clarifyingQuestion: '¿Cuál es tu presupuesto máximo (y en qué moneda)?',
      };
    } else {
      answer = {
        message: `Estas opciones encajan con tu presupuesto [1].`,
        products: [recommendCard(PRODUCTS[0]), recommendCard(PRODUCTS[1])],
      };
    }
    pushMessage(
      'ASSISTANT',
      answer.message,
      answer.products.flatMap((card) => card.citations),
      answer.products,
    );
    const accept = req.headers['accept'] ?? '';
    if (accept.includes('text/event-stream')) {
      res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      });
      for (const word of answer.message.split(/(\s+)/).filter((part) => part.length > 0)) {
        res.write(`event: delta\ndata: ${JSON.stringify({ text: word })}\n\n`);
      }
      res.write(`event: products\ndata: ${JSON.stringify({ products: answer.products })}\n\n`);
      if (answer.clarifyingQuestion) {
        res.write(
          `event: clarifyingQuestion\ndata: ${JSON.stringify({ clarifyingQuestion: answer.clarifyingQuestion })}\n\n`,
        );
      }
      res.write('event: done\ndata: {}\n\n');
      res.end();
      return;
    }
    send(res, 200, answer);
    return;
  }
  if (method === 'POST' && path === '/advisor/product-qa') {
    const product = ALL_PRODUCTS.find((candidate) => candidate.id === body.productId);
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

  // Post-sale support (fake adapters): cited policy answer, abstention and
  // rate-limit probes; order lookups resolve against the mock orders above.
  if (method === 'POST' && path === '/advisor/support') {
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
        answer: 'No tengo esa información en las políticas de la tienda.',
        citations: [],
        abstained: true,
      });
      return;
    }
    if (typeof body.orderId === 'string' && body.orderId.length > 0) {
      const order = state.orders.find((candidate) => candidate.id === body.orderId);
      if (!order) {
        const err = uniformError(404, 'NOT_FOUND', 'Order not found');
        send(res, err.status, err.body);
        return;
      }
    }
    send(res, 200, {
      answer: 'Los portátiles tienen 2 años de garantía [1].',
      citations: [
        {
          n: 1,
          documentId: 'doc-mock-warranty',
          chunkId: 'chunk-mock-warranty-1',
          title: 'Política de garantía',
          snippet: 'Los portátiles tienen 2 años de garantía desde la entrega…',
        },
      ],
      abstained: false,
    });
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
