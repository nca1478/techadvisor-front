// Generates TypeScript types from the backend OpenAPI contract.
// Usage: npm run api:types (requires the backend running with DOCS_ENABLED=true).
// Reads API_BASE_URL (server-side base, e.g. http://localhost:3001/api/v1),
// fetches the docs-json document and writes src/lib/api/schema.d.ts.
// The generated file is versioned; the frontend never imports backend code.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const outFile = join(repoRoot, 'src', 'lib', 'api', 'schema.d.ts');

function docsJsonUrl() {
  const raw = (process.env['API_BASE_URL'] ?? 'http://localhost:3001/api/v1').trim();
  const base = raw.replace(/\/+$/, '');
  // API_BASE_URL already contains the /api/v1 prefix in this project; tolerate both shapes.
  return base.endsWith('/api/v1') ? `${base}/docs-json` : `${base}/api/v1/docs-json`;
}

const url = docsJsonUrl();
console.log(`Fetching OpenAPI document from ${url} ...`);
const res = await fetch(url);
if (!res.ok) {
  console.error(
    `api:types failed: GET ${url} returned ${res.status}. Is the backend running with DOCS_ENABLED=true?`,
  );
  process.exit(1);
}
const schema = await res.json();

console.log('Generating TypeScript types ...');
const ast = await openapiTS(schema);
const types = astToString(ast);
const header = `/**\n * Generated from the backend OpenAPI contract (${url}).\n * Do not edit by hand - run \`npm run api:types\` instead.\n */\n`;
await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, `${header}${types}`, 'utf8');
console.log(`Wrote ${outFile}`);
