# 0026 — Sesiones de chat en el widget del asesor (frontend)

Fecha: 2026-10-10
Estado: aceptado

## Contexto

El backend registra turnos de product-QA en una sesión (`sessionId`
opcional, ADRs 0029/0030 del backend) pero el widget preguntaba sin sesión
(modo sin estado). Además estaba pendiente la nota de privacidad en la UI, y
el contrato OpenAPI del frontend (`schema.d.ts`) no incluía `advisor/sessions`.

## Decisión

- BFF `POST /api/advisor/sessions` (`src/app/api/advisor/sessions/route.ts`)
  que reenvía al backend con `proxyToBackend`: las cookies (`sid`,
  `ta_access`) viajan en ambos sentidos sin código extra.
- El contenedor `ProductAdvisor` abre la sesión al montar (remontado por
  producto vía `key={product.id}`) y envía su id en cada pregunta. La
  apertura comparte una promesa por montaje: una pregunta temprana espera a
  la sesión en vez de duplicarla.
- Degradación y rotación: si abrir sesión falla, el widget pregunta sin
  sesión (sigue funcionando); un 404 con sesión rota la sesión una vez y
  reintenta (la sesión pudo purgarse por retención); si el reintento también
  da 404, se muestra el error `notFoundError` existente. Sin reintentos
  encadenados.
- `src/lib/api/advisor.ts`: `askProduct` acepta `sessionId?` y nuevo
  `createSession()` con Zod (`ChatSession`), exportado en `lib/api/index.ts`;
  tipos locales como hasta ahora (ver ADR 0025).
- Nota de privacidad (`privacyNote` en `es`/`en`, junto al `disclaimer`):
  avisa de que la conversación se guarda y de no incluir datos personales.
- `npm run api:types` regenerado contra el backend real: ya incluye
  `advisor/sessions*` y `ChatSession*`. Limitación conocida (lado backend):
  los bodies validados con `ZodValidationPipe` no generan `requestBody` en
  `docs-json`, así que el `sessionId` del QA no aparece en el esquema (los
  tipos locales del BFF siguen mandando).
- Mock e2e: `POST /advisor/sessions` devuelve sesiones incrementales; el
  cableado `sessionId` se verifica en el test de contenedor (vitest), y
  Playwright cubre la nota de privacidad visible.

## Consecuencias

- Cada visita a una ficha abre una sesión (una fila por vista de producto,
  incluso sin preguntar); las anónimas las purga la retención del backend.
- La Fase 4 (chat conversacional) reutiliza este `sessionId` para historial.

## Cómo revertir

Quitar la apertura de sesión del contenedor y la ruta BFF: el QA vuelve a
modo sin estado (el backend lo soporta) y la nota de privacidad queda como
texto estático.
