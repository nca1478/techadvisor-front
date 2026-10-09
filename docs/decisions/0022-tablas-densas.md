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

## Dependencias (verificación obligatoria)

- Context7 disponible en la sesión; solo clases Tailwind existentes y
  tokens propios. Sin `npm install`, sin versiones que registrar.
