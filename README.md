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

| Script            | What it does                          |
|-------------------|---------------------------------------|
| `npm run dev`     | dev server (port 3000)                |
| `npm run build`   | production build                      |
| `npm run lint`    | eslint                                |
| `npm run typecheck` | `tsc --noEmit`                      |
| `npm test`        | placeholder (wired in a later task)   |
| `npm run test:e2e`| placeholder (playwright, later task)  |
| `npm run api:types` | placeholder (OpenAPI types, P0.5)   |

## Layout

- `src/app/` — routes (App Router)
- `src/features/` — feature modules (catalog, cart, checkout, advisor, account)
- `src/components/ui/` — generic presentational components (no fetching here)
- `src/lib/api/` — API client + types generated from the backend OpenAPI
