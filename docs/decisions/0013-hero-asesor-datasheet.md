# 0013 — Hero del asesor (mock) + specs como datasheet

Date: 2026-10-08
Status: accepted

## Context

La auditoría de diseño encontró que el diferenciador RAG es invisible en la
home (el H1 es solo la marca) y que `product-info` filtra claves crudas
(`ram_gb`, `socket`) al usuario. No existe aún módulo `advisor` en backend
ni endpoint `POST /advisor/*`, así que el hero no puede llamar a una API
real sin romper el contrato OpenAPI.

## Decisiones

1. Hero presentacional `home-advisor-hero` con contenido mock claramente
   etiquetado como ejemplo (`homeAdvisorBadge: "Asesor · ejemplo"`). Los
   picks son productos reales del catálogo (los 3 primeros en stock que ya
   trae `home-container`); la respuesta es ilustrativa y cita `[1][2][3]`.
   Los CTA enlazan a rutas que ya existen: `/[locale]/buscar?q=...` y
   `/[locale]/productos/[slug]`. Sin fetch, sin streaming, sin estado.
2. Specs como tabla datasheet (`dl` con hairlines `border-border`) en vez de
   cajas idénticas. Etiquetas vía `catalog.specLabels` (es/en) en los
   diccionarios; `spec-labels.ts` (`humanizeSpecKey`, `formatSpecValue`)
   con fallback seguro (clave humanizada si falta traducción, `—` si el
   valor es nulo). Unidades como símbolos universales en código
   (`GB`, `GHz`, `W`…), no traducibles.
3. Sin cambios de tokens (`globals.css` intacto, se reutilizan
   `primary/accent/surface/border`), sin nuevas dependencias.

## Dependencias (verificación obligatoria)

- Context7 está disponible como herramienta en esta sesión; se usó para
  verificar que no se necesita ninguna librería nueva (Tailwind v4 +
  Next 16 + primitivas propias cubren el hero y la tabla). No se ejecuta
  `npm install` ni se registra versión alguna porque no hay nada que
  versionar.

## Consequences

- Cuando llegue el backend Fase 3, el hero se conecta al contrato real
  (`POST /api/v1/advisor/*`) sin cambiar su estructura visual; el mock se
  sustituye por datos de la API.
- `catalog.specLabels` debe mantenerse en sync es/en (el test
  `dictionaries.test.ts` exige las mismas claves de `catalog`); las claves
  de spec siguen al backend (`spec-fields.ts`, fuente de verdad).
