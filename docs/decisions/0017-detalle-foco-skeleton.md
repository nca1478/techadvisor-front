# 0017 — Detalle: foco visible en galería + skeleton con identidad

Date: 2026-10-08
Status: accepted

## Context

La galería del detalle usa botones nativos (operables por teclado) pero sin
anillo de foco visible: solo cambia el borde del activo. La página del slug
tampoco tiene estado de carga (el contenedor asíncrono bloquea el render).
En móvil la tabla de specs ya ocupa todo el ancho (la rejilla de dos
columnas apila), pero valores largos podrían desbordar las celdas.

## Decisiones

1. Miniaturas con el mismo anillo de foco del sistema (`ring` + offset
   sobre `background`, patrón de `Button`/`Link`). Solo CSS, sin cambios de
   comportamiento ni de marcado accesible (`aria-pressed` intacto).
2. `DetailSkeleton` (galería + bloque info + filas de specs, misma rejilla
   `two`) como `Suspense` en `[slug]/page.tsx`, con `loadingLabel`
   localizado. Sin copiar `loading.tsx` por ruta: el skeleton necesita el
   diccionario y la página ya lo tiene.
3. Celdas de specs con `min-w-0` y `break-words`: robustez ante strings
   largos con utilidades estándar, sin breakpoints ni medidas arbitrarias.

## Dependencias (verificación obligatoria)

- Context7 disponible en la sesión; solo React (`Suspense`) y primitivas
  propias. Sin `npm install`, sin versiones que registrar.

## Consequences

- Ningún cambio visual en estado reposo salvo el foco por teclado, que
  antes era invisible.
