// ESLint flat config — frontend repo.
// Own config of this repo; intentionally duplicated (not shared) with backend.
// Next.js presets plus strict TypeScript rules; explicit `any` is forbidden
// unless justified with:
//   // justificado: <motivo>
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
// (reportUnusedDisableDirectives ensures stale disables fail lint.)
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.strictTypeChecked,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['**/*.mjs', '**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    // Test helpers (Testing Library matchers, etc.) flow implicit `any`
    // from third-party types; keep the explicit-`any` ban everywhere.
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'vitest.config.ts', 'vitest.setup.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
