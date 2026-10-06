# 0002 — Code quality: ESLint, Prettier, Husky, tests

Date: 2026-10-06
Status: accepted

## Context

P0.2 requires per-repo quality gates (lint, typecheck, test) running on every
commit and in CI. This repo (`frontend/`) is independent from `backend/`: own
`package.json`, own configs, no shared packages or relative imports (see
0001-estructura-de-proyectos.md). The scaffold shipped with
`eslint-config-next` presets, a placeholder `npm test`, and no Prettier or
Vitest wiring.

## Decision

- **Linter: ESLint (flat config) in `eslint.config.mjs`.** Keeps the Next.js
  presets (`core-web-vitals` + `typescript`) and adds `typescript-eslint`
  **strictTypeChecked** (type-aware via `projectService: true`, consistent with
  `strict: true` in `tsconfig.json`) plus `eslint-config-prettier` (flat) so
  Prettier owns formatting and ESLint never conflicts with it.
  - `@typescript-eslint/no-explicit-any: error`. Exception workflow for the
    rare justified case:
    ```tsx
    // justificado: <motivo>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ```
    `reportUnusedDisableDirectives: error` keeps stale disables failing lint.
  - Test/config override (`*.test/tsx`, `*.spec/tsx`, `vitest.config.ts`,
    `vitest.setup.ts`): `no-unsafe-*` off. Rationale: test helpers flow
    implicit `any` from third-party types; the explicit-`any` ban stays on
    everywhere. JS/MJS files use `disableTypeChecked`.
- **Formatter: Prettier with this repo's own `.prettierrc`** (singleQuote,
  trailingComma all, printWidth 100, tabWidth 2, semi, lf). `.prettierignore`
  covers `.next/`, `out/`, `build/`, `coverage/`, `node_modules/`,
  `next-env.d.ts`, `public/`. Config is intentionally duplicated (not shared)
  with the backend repo.
- **Hooks: Husky + lint-staged.** `prepare: husky` script; `.husky/pre-commit`
  runs `npx lint-staged`; `.lintstagedrc.json` runs `eslint --fix` and
  `prettier --write` on staged `*.{ts,tsx,mts,cts,mjs,js,json}`. No commitlint
  or other tools (per task restrictions).
- **Tests: Vitest + Testing Library (new).** `vitest.config.ts` (React plugin,
  `jsdom`, `setupFiles: ./vitest.setup.ts` with
  `@testing-library/jest-dom/vitest`), `npm test` = `vitest run`,
  `npm run test:watch` = `vitest`. Trivial green test:
  `src/components/ui/__tests__/placeholder.test.tsx` (renders a label with
  Testing Library + jest-dom matcher). Container/Presenter primitives arrive
  in P1.9; the test defines its own inline component so no business code is
  added prematurely.
- **Scripts:** `lint` (`eslint .`), `lint:fix`, `typecheck` (`tsc --noEmit`),
  `test` (`vitest run`) — all exit 0 on the scaffold. `test:e2e` and
  `api:types` placeholders remain for P0.5/P1.13.

## Versions pinned (latest per Context7 docs + `npm view`, 2026-10-06)

Context7 MCP active; docs consulted for `typescript-eslint` (flat
strictTypeChecked setup) and `vitest` (jsdom + Testing Library setup).
Installed:

- `typescript-eslint@^8.71.1`, `eslint-config-prettier@^10.1.8`,
  `husky@^9.1.7`, `lint-staged@^17.6.0`, `prettier@^3.4.2` (3.x line; the
  `prettier` binary itself was missing from the scaffold and is required by
  the lint-staged `prettier --write` step).
- `vitest@^4.1.11` (4.x line, **not** latest 5.0.3: v5 requires
  `@types/node ^22 || >=24` but this scaffold pins `@types/node ^20`;
  v4 matches the backend repo and resolves cleanly — simplest option).
- `jsdom@^30.1.2`, `@vitejs/plugin-react@^6.1.2`,
  `@testing-library/react@^16.3.3` (React 19 compatible),
  `@testing-library/jest-dom@^7.0.1`.
- Kept (scaffold): `eslint@^9`, `eslint-config-next@16.3.8`.

## Consequences

- Every commit runs ESLint --fix + Prettier on staged files; a lint error
  blocks the commit.
- `any` requires a `// justificado:` comment plus a targeted disable; CI can
  enforce the same via `npm run lint`.
- UI texts stay out of this task (i18n arrives in P1.10); the sample test
  uses a neutral label.
