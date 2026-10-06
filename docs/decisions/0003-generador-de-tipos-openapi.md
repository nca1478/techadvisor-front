# 0003 — Generador de tipos OpenAPI para el frontend

Date: 2026-10-06
Status: accepted

## Context

The frontend must not import backend code; it consumes the OpenAPI contract
the backend publishes at `GET /api/v1/docs-json` and generates types into
`src/lib/api/schema.d.ts` via `npm run api:types`. The generated file is
versioned. Versions were checked with the Context7 MCP (library
`openapi-ts/openapi-typescript`) and `npm view openapi-typescript version`
before installing.

## Decision

- **`openapi-typescript@7.13.0` pinned** as a devDependency (latest at the
  time of this task). It is a types-only generator: zero runtime cost, no
  client code emitted, just `paths`/`components`/`operations` interfaces the
  hand-written client in `src/lib/api/` imports.
- **`scripts/api-types.mjs`** fetches the document (tolerating both
  `API_BASE_URL` shapes, with or without the `/api/v1` suffix) and calls the
  programmatic API (`openapiTS(schema)` + `astToString`, required in v7 since
  the transform returns an AST). It fails loudly when the backend is not
  reachable or `DOCS_ENABLED` is off, instead of writing an empty file.
- Alternatives considered: `hey-api` (also generates clients/SDKs — more than
  this phase needs; the hand-written `fetch` client keeps the uniform
  `{ statusCode, code, message, details? }` error handling explicit and tiny).

## Versions pinned (2026-10-06)

- `openapi-typescript@7.13.0`

## Consequences

- `npm run api:types` requires the backend running (`DOCS_ENABLED=true`).
- After any backend contract change: regenerate types, then adapt the client.
- The generated `schema.d.ts` is committed so CI builds without the backend.
