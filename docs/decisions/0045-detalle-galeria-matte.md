# 0045 — Extender matte blanco a la galería del detalle

Date: 2026-10-14
Status: accepted

## Context

ADR 0044 unificó el grid con `fit="contain" tone="light"` porque las fotos
del seed tienen recortes intrínsecos distintos y fondos mixtos
(blanco vs transparente). El detalle del producto (`ProductGallery`) quedó
fuera ("siguen en `cover/dark`") y reproduce el mismo defecto: encuadre
recortado desigual en el hero `aspect-4/3` y miniaturas sobre fondo oscuro
mientras el grid muestra matte blanco.

## Decision

1. `ProductGallery` usa el mismo patrón del grid: hero y miniaturas con
   `fit="contain" tone="light"` (`MediaFrame`).
2. Hero conserva `ratio="standard"` + `rounded="lg"` y suma
   `border-border` para definir el matte blanco sobre el fondo ink, con
   `p-6` de aire (el grid usa `p-2` en tarjeta pequeña).
3. Miniaturas conservan `ratio="square"` + glow volt en la activa y suman
   `p-1` sobre el matte común.
4. Sin cambios en API, `placeholder.svg` ni tema Signal Lab: el blanco es
   color del contenido fotográfico, no superficie UI (igual que 0044).

## Consequences

- Detalle y grid leen como el mismo sistema: producto completo, mismo fondo.
- `contain` deja aire lateral en fotos apaisadas: asumido (igual que 0044),
   preferible al recorte desigual.
- Tests: `product-gallery.test.tsx` cubre hero + miniaturas en
  `object-contain` sobre `bg-white`.
