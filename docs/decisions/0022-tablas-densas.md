# 0022 — Tablas densas: numéricos a la derecha con tabular-nums

Date: 2026-10-09
Status: accepted

## Context

Las 10 tablas del frontend (cuenta + 7 vistas admin) alineaban todo a la
izquierda: totales, stocks y conteos no se pueden comparar de un vistazo.
Se pide acabado denso estilo marketplace sin tocar funcionalidad.

## Decisiones

1. Columnas numéricas (cantidades, precios, totales, stocks, fragmentos)
   alineadas a la derecha con `tabular-nums`; la columna de total además
   en `font-medium`. Los encabezados siguen la alineación de su columna.
   Primera columna (identidad) siempre a la izquierda.
2. `documents-table` se unifica al patrón común (marco con borde, thead
   gris, zebra); conserva su padding compacto propio.
3. Sin color semántico en deltas de inventario: el verde sobre la fila
   zebra da 4.00 (falla AA); un encoding a medias confunde más que ayuda.
4. Sin cambios de copy, contratos, rutas ni lógica. Sin estrellitas ni
   adornos: la densidad es la comparabilidad.

## Addendum 2026-10-09 — jerarquía visible

La alineación sola resultó demasiado sutil en revisión visual: se añade
jerarquía tipográfica sin salir del sistema — totales y disponible en
`text-base font-bold`, IDs en mono atenuado, encabezados en `text-xs`
(conservando las mayúsculas originales, nunca ALL-CAPS). Todo sigue
siendo información, no decoración.

## Addendum 2026-10-09 — imagen de referencia del usuario

La zebra y el thead gris se retiran: la referencia pide tabla blanca
sobre gris con solo hairlines, cabecera blanca pequeña y atenuada,
primera columna con énfasis y numéricos a la derecha. La jerarquía queda
en peso tipográfico (nombres medium, totales bold al mismo tamaño) en vez
de fondos. Las palabras del brief mandan sobre la calibración.

## Dependencias (verificación obligatoria)

- Context7 disponible en la sesión; solo clases Tailwind existentes y
  tokens propios. Sin `npm install`, sin versiones que registrar.
