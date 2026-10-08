# 0016 — Header responsive + skeletons con identidad

Date: 2026-10-08
Status: accepted

## Context

Dos fricciones detectadas en la revisión: en móvil estrecho la fila del
header (marca + nav + sesión + controles) se aprieta sin partirse, y los
estados de carga son una tarjeta de texto genérica (`CatalogLoading`) o
inexistentes — el `ProductGridSkeleton` existe pero nadie lo usa, y los
`Suspense` de listado/búsqueda envuelven datos ya resueltos.

## Decisiones

1. Header: `wrap` en las dos filas horizontales (API existente de `Stack`).
   En móvil los grupos caen a líneas propias y la fila de categorías ya
   hace scroll horizontal. Sin reestructurar el DOM ni media queries ad
   hoc.
2. Home con streaming real: `Suspense` + `HomeSkeleton` (pregunta del
   asesor + rejilla con el preset `products`) en `[locale]/page.tsx`. El
   `HomeContainer` asíncrono suspende en sus fetches y el esqueleto se
   muestra en la carga inicial.
3. `ListingSkeleton` (filtros + misma rejilla) como fallback de
   `/productos` y `/buscar`, en vez de la tarjeta de texto. Misma forma
   que el contenido que sustituye.
4. Feedback durante la navegación de filtros: `router.replace` envuelto en
   `startTransition` (`use-listing-query` y `search-view`) con `isPending`
   que atenúa la rejilla (`opacity-60` instantáneo, sin animación
   decorativa) y marca `aria-busy`. Es la carga más frecuente (cada filtro)
   y hasta ahora era invisible.

## Dependencias (verificación obligatoria)

- Context7 disponible en la sesión; solo React/Next existentes
  (`Suspense`, `useTransition`) y primitivas propias. Sin `npm install`,
  sin versiones que registrar.

## Consequences

- Los fallbacks de `Suspense` en listado/búsqueda siguen raramente
  visibles (las páginas resuelven antes de renderizar); el estado visible
  real en filtros es el `isPending`. Un futuro `loading.tsx` por ruta
  queda como mejora explícita.
