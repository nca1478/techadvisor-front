# 0038 — Etiquetas del eje X en el gráfico de 30 días

Fecha: 2026-10-13
Estado: aceptado

## Contexto

Con el rango `30d` el gráfico de "Ventas cobradas" mostraba 7 fechas
(paso 5) dentro de columnas de 24 px (`min-w-6`), así que textos como
"14 sept" se partían en dos líneas y el eje se veía apretado.

## Decisión

- En rangos largos (> 24 buckets) se muestran máx. 5 etiquetas
  equidistantes, primera y última siempre visibles:
  `paso = ceil((n - 1) / 4)` (con 30 buckets: índices 0, 8, 16, 24 y 29).
- Las etiquetas visibles llevan `whitespace-nowrap` para que cada fecha
  quede en una sola línea; las vecinas son `sr-only`, así que hay espacio
  sin solapes. El resto (`today`/`7d`) no cambia.
- Sin nuevas dependencias ni cambios de datos: solo presentación.

## Consecuencias

- El eje de 30d pasa de 7 a 5 fechas, con ritmo aprox. semanal.
- Accesibilidad intacta: cada barra sigue con `aria-label "fecha · importe"`.

## Addendum — alineación de la base (2026-10-13)

Las etiquetas ocultas usaban `sr-only` (posición absoluta, sin altura en
el layout), así que solo las columnas con fecha visible reservaban espacio
de etiqueta y su línea base quedaba más alta: la línea de días se veía
descuadrada. Se cambió a `invisible` (ocupa el mismo alto de una línea,
no se ve) con `aria-hidden`, de modo que las 30 columnas alinean base y
barras. Sin cambios visuales en las etiquetas visibles.
