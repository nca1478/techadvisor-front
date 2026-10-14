# 0044 — Unificar fotos del grid: contain + matte blanco

Date: 2026-10-14
Status: accepted

## Context

Una tarjeta del grid se veía "diferente" (foto recortada con otro encuadre).
Causa: `MediaFrame` usaba `object-cover` + `aspect-square` en todas las
tarjetas. Las fotos del seed (speedlogic PNGs) tienen recortes intrínsecos
distintos (padding/orientación), así que el recorte centrado producía un
encuadre distinto por producto. Además, PNGs con fondo transparente mostraban
el `bg-surface-raise` oscuro mientras las fotos blancas lo cubrían: doble
fuente de inconsistencia.

## Decisiones

1. `MediaFrame` acepta `fit: 'cover' | 'contain'` (defecto `cover`) y
   `tone: 'dark' | 'light'` (defecto `dark`). Sin cambios para gallery,
   advisor y resto: siguen en `cover/dark`.
2. Solo el grid del catálogo (`ProductCard`) usa `fit="contain" tone="light"
   className="p-2"`: muestra el producto completo sobre matte blanco común,
   sin recorte diferencial. El blanco es color del contenido fotográfico
   (como los flags), no superficie UI; el tema Signal Lab oscuro no cambia.
3. No se toca `placeholder.svg` ni el contrato API.

## Consequences

- Grid uniforme: mismo marco, mismo fondo, producto completo visible.
- `contain` + `p-2` deja aire lateral en fotos apaisadas: asumido, preferible
  al recorte desigual.
- Tests: `media-frame.test.tsx` cubre defecto `cover/dark` y variante
  `contain/light`.
