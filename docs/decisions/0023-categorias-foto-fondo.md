# 0023 — Tarjetas de categoría con foto de fondo

Date: 2026-10-09
Status: accepted

## Context

La sección "Compra por categoría" del home mostraba solo el nombre en una
`Card` de superficie. Visualmente pobre frente a las tarjetas de producto
(con foto). El backend no guarda imagen por categoría, así que no hay de
dónde leerla vía API.

## Decision

- Nuevo mapa estático `category-images.ts` (`slug → foto Unsplash`
  relacionada, IDs verificados con HTTP 200) + `categoryImageSrc(slug)` que
  devuelve `null` ante slugs desconocidos (el catálogo puede crecer sin
  romper el home).
- `CategoryGrid` reutiliza `MediaFrame` (aspecto `video` fijo, fallback a
  `/placeholder.svg` y boundary que evita crashes por host no configurado),
  overlay con el token `header` (`from-header/85 ...`) y título en
  `text-header-foreground`. Sin colores crudos fuera de `globals.css`.
- `images.unsplash.com` se añade al default de `IMAGE_REMOTE_HOSTS`
  (`next.config.ts`) y a `.env.example`.
- La foto es decorativa (`alt=""`): el nombre accesible lo da el `aria-label`
  del enlace, como antes.

## Consequences

- Si Unsplash falla o un slug es nuevo, se ve el placeholder local con el
  título encima: degradación elegante, sin página rota.
- Añadir una categoría con foto propia = una línea en `category-images.ts`.
- Hotlinking a Unsplash: sujeto a sus términos/límites; si algún día se
  quieren fotos propias, el punto de cambio es el mismo mapa (o un campo
  `image_url` en el backend, fuera del alcance de esta tarea).
