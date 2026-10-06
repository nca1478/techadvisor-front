# 0004 — Playwright e2e mínimo para la Fase 0

Date: 2026-10-06
Status: accepted

## Context

`npm run test:e2e` era un placeholder (`node -e "console.log(...)"`) y el CI
del frontend no ejecutaba ningún e2e. AGENTS.md §9 exige
`npm run test:e2e # Playwright (API simulada en CI)`, y la revisión de cierre
de la Fase 0 lo marcó como único NO CUMPLE bloqueante.

## Decision

- **`@playwright/test@1.63.0` exacto** como devDependency (última estable
  según `npm view @playwright/test version` y librería
  `/microsoft/playwright` del MCP de Context7, consultado antes de instalar).
- **`playwright.config.ts`**: `testDir: ./e2e`, un solo proyecto (chromium
  por defecto para mantener el CI rápido), `baseURL http://localhost:3000` y
  `webServer` que levanta `npm run dev -- --port 3000`
  (`reuseExistingServer` en local, siempre nuevo en CI).
- **`e2e/home.spec.ts`**: un smoke de `/` (h1 `TechAdvisor` + tagline
  visibles). La home es estática y no llama a la API, así que este smoke no
  necesita backend ni mocks; los e2e con API simulada llegan en la Fase 1.
- **CI**: `npx playwright install --with-deps chromium` + `npm run test:e2e`
  tras el build.

## Consequences

- `npm run test:e2e` requiere los navegadores (`npx playwright install
chromium`; en Linux CI lo hace el workflow con `--with-deps`).
- `test-results/`, `playwright-report/` y `blob-report/` están en
  `.gitignore` y no se versionan.
