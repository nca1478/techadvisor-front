# 0001 — Two independent projects, npm, no shared code

Date: 2026-10-06
Status: accepted

## Context

TechAdvisor is developed as two sibling projects (`backend/`, `frontend/`) inside an
unversioned working folder. We need reproducible installs and independent deployability
of API and web.

## Decision

- Two **independent git repos**: one in `backend/`, one in `frontend/`. The working
  root is not versioned.
- Package manager: **npm only** (no workspaces, no pnpm/yarn). Each project owns its
  `package.json` + `package-lock.json` and installs with `npm ci`.
- **No shared code or imports** between projects (no relative imports like
  `../backend/...`, no local packages).
- API contract sync via **OpenAPI**: backend serves `GET /api/v1/docs-json`
  (from P0.5 on); frontend generates types with `npm run api:types` and versions the
  output under `src/lib/api/`.
- Public runtime config (`BASE_CURRENCY`, supported currencies/locales) is served by
  `GET /api/v1/config/public` so the frontend never duplicates it.

## Versions pinned at scaffold (latest per `npm view` + Context7 docs, 2026-10-06)

- Frontend: Next.js `16.3.8` (official `create-next-app` scaffold, App Router +
  `src/` + `@/*` alias), React `19.2.8`, Tailwind CSS `^4`
  (`@tailwindcss/postcss`), TypeScript `^5`, eslint `^9` + `eslint-config-next`,
  zod `4.6.5`.
- `test` / `test:e2e` / `api:types` are exit-0 placeholders until their Fase 0 tasks
  (test runner, Playwright, OpenAPI codegen) land.

## Consequences

- Changes spanning both sides are done in two steps (backend first) with one commit
  per repo. Never mix backend/frontend changes in a single commit.
