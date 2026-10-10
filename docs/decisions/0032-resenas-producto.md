# 0032 — Reseñas de producto (listado, resumen y formulario)

## Contexto

Fase 6, P6.2: la página de producto muestra las reseñas publicadas, el
resumen pros/contras generado por el backend y un formulario para reseñar.
Rigen el sistema de diseño (tokens y primitivas, ADR 0005) y
Container/Presenter (contenedores con datos, `ui/` sin fetch).

## Decisión

Nueva feature `src/features/reviews/` integrada en
`ProductDetailContainer` debajo del widget del asesor:

1. **Cliente API (`src/lib/api/reviews.ts`).** Tipos locales + validación
   Zod mínima sobre el contrato OpenAPI (sin importar código del backend):
   `listPublished`, `getSummary` (`{ summary | null }`: `null` mientras no
   alcance el mínimo) y `createReview` (cuerpo validado antes de enviar).
2. **BFF (`src/app/api/reviews/[[...path]]/route.ts`).** Catch-all opcional
   que reenvía método, cuerpo, query y cookies al backend (`GET` lista y
   resumen, `POST` crea con las cookies httpOnly de auth). La opción más
   simple frente a una ruta por endpoint; el navegador nunca necesita la URL
   del backend y la creación usa las cookies sin exponer tokens.
3. **UI.** `ProductReviews` (cliente: lee por el BFF, paginación con
   "cargar más", estados de carga/error con reintento) compone tres
   presentacionales sin fetch: `ReviewSummaryView` (pros/contras + aviso
   obligatorio "generado automáticamente a partir de X reseñas"),
   `ReviewListView` (media, estrellas accesibles, insignia de compra
   verificada, estado vacío) y `ReviewForm` (llamada inyectada por prop,
   validación local, éxito = aviso de pendiente de moderación — la lista no
   cambia porque lo nuevo es `PENDING`).
4. **i18n.** Sección `reviews` en `es`/`en` (sin textos hardcodeados),
   con paridad de claves cubierta en `dictionaries.test.ts`.

## Alternativas consideradas

- SSR de reseñas en el contenedor de detalle: rechazado — la sección es
  interactiva (formulario, cargar más) y no es crítica para el SEO de la
  página; el cliente la hidrata por el BFF como el widget del asesor.
- Refrescar la lista tras enviar: rechazado — las reseñas nuevas son
  `PENDING` e invisibles hasta la moderación; el aviso de pendiente es la
  respuesta correcta.
