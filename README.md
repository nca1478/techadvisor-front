# TechAdvisor — Frontend

Next.js (App Router) web for the TechAdvisor tech ecommerce (B2C).
Runs on port **3000** and talks to the backend API via `API_BASE_URL` /
`NEXT_PUBLIC_API_BASE_URL` (wired in a later task).

> Source of truth: [`../AGENTS.md`](../AGENTS.md).
> Note: `AGENTS.md` in this folder is auto-generated Next.js vendor guidance;
> the product spec lives in the root `AGENTS.md`.

## Run

```bash
npm ci
npm run dev      # http://localhost:3000
```

## Pointing to the local API

The web talks to the backend API via `API_BASE_URL` (server-side) and
`NEXT_PUBLIC_API_BASE_URL` (browser-side). Both default to the local API;
no database services are defined here (infrastructure lives in `backend/`).

```bash
cp .env.example .env.local    # once: create your local env file (never commit it)
# .env.example already points both variables at http://localhost:3001/api/v1
npm run dev                  # start the backend first (see backend/README.md)
```

> Never put secrets in `NEXT_PUBLIC_*` variables — they are exposed to the browser.

## Scripts

| Script              | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | dev server (port 3000)                    |
| `npm run build`     | production build                          |
| `npm run lint`      | eslint                                    |
| `npm run typecheck` | `tsc --noEmit`                            |
| `npm test`          | unit / component tests (vitest)           |
| `npm run test:e2e`  | e2e smoke (playwright, chromium)          |
| `npm run api:types` | regenerate API types from backend OpenAPI |

## E2E

```bash
npx playwright install chromium   # once: download the browser (CI uses --with-deps)
npm run test:e2e                  # mock API: no backend, no Stripe needed
```

The suite (`e2e/`) runs against a contract-shaped mock backend by default
(`e2e/mock-backend.mjs`, started automatically by `playwright.config.ts`):
SSR pages and the `/api/*` BFF proxies both point at it, and the mock
simulates the payment confirmation (`POST /payments/checkout` flips the
order to `PAID` and returns a same-origin `checkoutUrl`). Covered flows:
full purchase (register → search/filter → cart → checkout → paid order),
SEO metadata/JSON-LD/sitemap/robots, and the static home smoke. Rationale
in `docs/decisions/0010-e2e-mock-estrategia.md`; SEO/ISR strategy in
`docs/decisions/0009-seo-isr.md`.

### E2E against the real backend (local)

```bash
# 1. Backend infra + API (from backend/):
docker compose up -d && npm run start:dev
# 2. Stripe test mode with the CLI (from backend/, see backend/README.md):
stripe listen --forward-to localhost:3001/api/v1/payments/webhook
# 3. Frontend e2e without the mock (from frontend/):
E2E_REAL=1 npm run test:e2e
```

In real-backend mode the checkout redirects to hosted Stripe Checkout
(test keys): complete the payment with a test card (e.g. `4242 4242 4242
4242`), and the order reaches `PAID` only via the webhook — the flow then
depends on timing (webhook delivery + the 2.5 s status polling), so it can
take a minute. `E2E_REAL=1` reuses your `.env.local` API URLs; the mock
mode overrides them automatically.

## Layout

- `src/app/` — routes (App Router)
- `src/features/` — feature modules (catalog, cart, checkout, advisor, account)
- `src/components/ui/` — generic presentational components (no fetching here)
- `src/lib/api/` — API client + types generated from the backend OpenAPI
