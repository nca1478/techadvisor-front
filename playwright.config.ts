// Playwright e2e config — frontend repo (see docs/decisions/0010-e2e-mock-estrategia.md).
// Default: the contract-shaped mock backend (`e2e/mock-backend.mjs`) serves
// the API so the suite never depends on the real backend or Stripe.
// Real-backend mode: `E2E_REAL=1 npm run test:e2e` (see README).
import { defineConfig } from '@playwright/test';

const MOCK_PORT = Number(process.env['MOCK_PORT'] ?? 3002);
const useMock = process.env['E2E_REAL'] !== '1';

const nextServer = {
  command: 'npm run dev -- --port 3000',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  // Dev-mode SSR under parallel workers is slow on loaded boxes (the dev
  // server compiles routes on demand while browsers, the mock and unrelated
  // local processes share the CPUs): 60s per test so a slow page load fails
  // the suite instead of timing the test out mid-flow.
  timeout: 60 * 1000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: useMock
    ? [
        {
          command: 'node e2e/mock-backend.mjs',
          url: `http://localhost:${String(MOCK_PORT)}/api/v1/config/public`,
          reuseExistingServer: !process.env.CI,
          timeout: 30 * 1000,
          env: {
            MOCK_PORT: String(MOCK_PORT),
            E2E_WEB_URL: 'http://localhost:3000',
          },
        },
        {
          ...nextServer,
          env: {
            API_BASE_URL: `http://localhost:${String(MOCK_PORT)}/api/v1`,
            NEXT_PUBLIC_API_BASE_URL: `http://localhost:${String(MOCK_PORT)}/api/v1`,
            NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
          },
        },
      ]
    : nextServer,
});
