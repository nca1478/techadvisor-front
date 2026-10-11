# 0033 — Panel admin del ciclo de mejora del asesor

Fecha: 2026-10-10
Estado: aceptado

## Contexto

P7.3 (ver ADR 0040 del backend): `/admin/asesor` cierra el ciclo de mejora
con grupos de preguntas sin respuesta por frecuencia, triaje de estados,
revisión de feedback con enlace a conversación y métricas. Restricción:
minimización de datos — el panel nunca muestra textos completos de usuario
salvo en detalles explícitos.

## Decisión

- Página server (`/admin/asesor`, solo ADMIN por el layout existente) que
  pide en paralelo `metrics`, `unanswered/groups` y `feedback` con filtros
  por URL (`status`, `gpage`, `fvalue`, `fpage`); el contenedor cliente
  (`admin-advisor-view.tsx`) solo muta (PATCH de triaje) y expande
  (detalle de voto, conversación minimizada) vía el BFF `/api/admin/*`,
  que ya reenvía cualquier ruta y verbo al backend.
- Resolver actúa sobre el grupo entero (todas sus ids, secuencial): cubre
  el criterio "marcarlas como resueltas" en un clic; el backend rechaza
  movimientos no hacia adelante y la UI muestra el primer conflicto.
- "Crear documento" enlaza a `/admin/documentos?title=<pregunta>` y la
  vista de documentos acepta `initialTitle` para pre-rellenar el título del
  alta (el resto del flujo de ingesta no cambia).
- Tipos desde el contrato regenerado (`npm run api:types`); los ids
  nulables del generador se leen con `asOptionalId` (mismo precedente que
  `AdminProductImage['alt']`).
- Sin librerías nuevas: se reutilizan `Card`, `Badge`, `Select`,
  `Pagination` y las tarjetas de sección del admin.

## Consecuencias

- Los textos completos de votos y conversaciones solo se piden bajo clic
  explícito ("Ver", "Conversación") y las conversaciones llegan ya
  minimizadas desde el backend (extractos de 200 caracteres).
