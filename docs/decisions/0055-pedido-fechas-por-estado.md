# 0055 — Fechas por estado en la línea de tiempo del pedido

Fecha: 2026-10-16

## Contexto

La cabecera del detalle mostraba `createdAt` junto al badge, no la fecha
de cada cambio de estado. El backend expone ahora
`statusHistory: [{ from, to, at }]` (ADR backend 0057).

## Decisión

- `OrderTimeline` recibe `locale` + `history` opcionales y pinta bajo
  cada paso alcanzado su fecha (`<time dateTime>` con el mismo formato
  `medium/short` de las cabeceras). Sin `history` (pedidos anteriores a
  la tabla) no inventa fechas: el paso inicial usa `createdAt` y el
  estado actual usa `updatedAt`.
- Las cabeceras del detalle (usuario y admin) muestran la fecha del
  último cambio registrado (`history.at(-1)`), con fallback a
  `updatedAt`.
- Sin claves i18n nuevas: las fechas se formatean con `Intl`.

## Consecuencias

- Los pedidos creados antes del backend 0057 solo fechan el paso
  inicial y el actual hasta que transicionen de nuevo.
