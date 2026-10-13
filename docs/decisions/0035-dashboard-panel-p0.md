# 0035 — Dashboard P0 del panel admin (KPIs + cola operativa)

Fecha: 2026-10-13
Estado: aceptado

## Contexto

El `Panel` solo mostraba pedidos recientes + poco stock, sin KPIs ni
acciones. Se quiere un dashboard operativo sin crear endpoint nuevo ni
agregar dependencias.

## Decisión

- KPIs calculados en el server (`admin/page.tsx`) desde muestras acotadas:
  `/admin/orders?limit=20` (tabla usa los 5 primeros), `/admin/products?limit=100`,
  más totales ligeros (`reviews PENDING limit=1`, `documents FAILED limit=1`,
  `advisor/metrics`). Todo en un `Promise.all`.
- Ingresos = suma de estados cobrados (`PAID, PROCESSING, SHIPPED, DELIVERED`)
  en la moneda modal de la muestra; etiqueta honesta `Últimos 20 pedidos`.
  Multi-moneda real queda para el endpoint agregado P1.
- Helpers puros en `features/admin/lib/dashboard-stats.ts` (testeables);
  `DashboardView` sigue siendo presenter server con tokens existentes
  (`Card`, `Badge`, `Stack`, `Text`, `Link`). Sin librerías de charts.
- Cola operativa enlaza a cada sección con filtros URL existentes
  (`resenas?status=PENDING`, `documentos?status=FAILED`).
- Sin nuevas dependencias: no se instala nada (context7 no aplica).

## Consecuencias

- Los KPIs son aproximaciones de muestra, no contabilidad; el P1 creará
  `GET /admin/metrics/overview` en el backend y esta vista lo consumirá.
- `outOfStock/lowStock` están acotados a los 100 productos cargados.
