# 0015 — Controles compactos de idioma/moneda + categorías sin slug

Date: 2026-10-08
Status: accepted

## Context

La captura de revisión de la tarea anterior mostró dos defectos en el
header y la home: los selects de idioma/moneda truncan el código ("USD" se
lee "USI") y ocupan dos filas visuales, y `category-grid` expone el `slug`
técnico (`ultrabook-pro-14`) como subtítulo de cada tarjeta.

## Decisiones

1. `Select` acepta `labelHidden` (misma API que `Input` ya tiene): la
   etiqueta sigue asociada vía `htmlFor` para lectores de pantalla con
   clase `sr-only`. Cambio aditivo, sin afectar usos existentes.
2. `LocaleCurrencyControls` usa `size="sm"`, etiquetas ocultas y anchos
   fijos (`w-20` idioma, `w-24` moneda): el código cabe siempre entero y
   el header pierde una fila visual. Sin nuevas claves de mensajes.
3. `CategoryGrid` muestra solo el nombre (cuerpo, semibold); se elimina el
   subtítulo con el slug. Los conteos por categoría o imágenes se
   difieren: el contrato `CatalogCategoryDto` no los trae y añadirlos
   exige tarea de backend primero (repos independientes, contrato vía
   OpenAPI). No se inventa numeración decorativa: las categorías no son
   una secuencia.

## Dependencias (verificación obligatoria)

- Context7 disponible en la sesión; ningún componente nuevo requiere
  librerías (primitivas y Tailwind existentes). Sin `npm install`, sin
  versiones que registrar.

## Consequences

- Si el backend expone conteos o imágenes por categoría en el futuro, el
  tile puede enriquecerse sin cambiar su estructura.
