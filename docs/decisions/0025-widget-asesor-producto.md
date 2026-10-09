# 0025 — Widget "Pregúntale al asesor" en la página de producto (frontend)

Fecha: 2026-10-09
Estado: aceptado

## Contexto

El backend expone `POST /advisor/product-qa` (respuesta citada con
abstención) pero el contrato OpenAPI aún no incluye `advisor`, y no existe
`POST /advisor/feedback` ni página de soporte en el frontend.

## Decisión

- Feature `src/features/advisor/` con patrón Container/Presenter: el
  contenedor (`product-advisor.tsx`, Client Component) pide al BFF
  same-origin `/api/advisor/*`; la vista presentacional no hace fetch.
- Tipos locales con Zod en `src/lib/api/advisor.ts` (no generados) hasta que
  el backend publique `advisor` en `docs-json`; entonces se regenera con
  `npm run api:types` (comentario `mantener en sync con backend`).
- La respuesta del LLM **nunca** se renderiza como HTML: se trocea por
  marcadores `[n]` como texto y solo `citations[]` estructuradas son botones.
- Preguntas sugeridas estáticas por `categorySlug` con fallback `default`
  (opción más simple, sin backend).
- Feedback 👍/👎 fire-and-forget al stub BFF `POST /api/advisor/feedback`
  (reenvía a `POST /advisor/feedback` del backend, hoy 404): la UI agradece
  igual para no bloquear. **Pendiente backend**: tabla `AdvisorFeedback`
  (migración aditiva) + endpoint + regenerar tipos.
- Enlace de abstención a `/{locale}/cuenta` (superficie real más cercana;
  **pendiente**: página o canal de soporte dedicado).

## Consecuencias

- `npm run api:types` cuando el backend publique el contrato advisor.
- Tarea backend separada: `AdvisorFeedback` + `POST /advisor/feedback`.
