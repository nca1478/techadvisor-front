# 0064 — Fechas en hora local del navegador (fix desfase +4h)

Fecha: 2026-10-19
Estado: aceptado

## Contexto

Con el backend en Render (región Oregon, contenedores con `TZ=UTC`) y la
base de datos en Supabase (`SHOW timezone` → `UTC`), todos los registros
mostraban la hora adelantada 4h respecto al PC del usuario (Windows 10 en
UTC-4, p. ej. América/Caracas). Ejemplo: pedido creado a las 2:16 PM local
se mostraba como "Oct 19, 2026, 6:16 PM".

Investigación:

- Supabase: `SELECT now()` devuelve hora UTC; `timezone = UTC`. Correcto.
- Backend: Prisma usa `DateTime @default(now())` sobre `timestamptz` y la API
  sirve ISO 8601 UTC (`…Z`). Correcto según AGENTS.md §4 (UTC en BD, ISO en API).
- Frontend: la página de detalle del pedido (`app/[locale]/cuenta/ordenes/[id]`)
  es un Server Component que formateaba con
  `new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' })`
  sin `timeZone`. En el servidor eso usa UTC; en el navegador del usuario
  habría usado UTC-4. El mismo patrón existía en `OrderTimeline`,
  `OrdersTable`, `DashboardView` y `ReviewListView`.

## Decisión

No se toca backend ni BD (están correctos en UTC). El fix es solo frontend:

- Nuevo Client Component `components/ui/formatted-date.tsx` (`FormattedDate`
  + helper `formatLocalDate`): pinta el ISO en crudo en SSR/hidratación
  (idénticos, sin mismatch) y lo reformatea en la zona horaria del navegador
  con un `useEffect` tras el montaje. `suppressHydrationWarning` se descartó
  explícitamente: React conserva el texto del servidor y nunca lo reemplaza,
  solo silencia el aviso — el primer intento con esa técnica no cambió nada
  en producción.
- Las vistas renderizadas en servidor usan `<FormattedDate>`:
  `OrderTimeline`, `OrdersTable`, página `cuenta/ordenes/[id]`,
  `DashboardView` (admin) y `ReviewListView`.
- Los contenedores que ya son `'use client'` (detalle/lista admin de
  pedidos, inventario, asesor, chat) no se tocan: ya formateaban en hora
  local correctamente.
- Se mantienen las funciones `formatOrderDate` / `formatTimelineDate` /
  `formatReviewDate` como envoltorios del helper para no romper imports y
  tests existentes.

## Alternativas descartadas

- Guardar hora local en BD o cambiar `timezone` de Supabase a UTC-4: rompe
  AGENTS.md §4 y el cálculo de métricas/buckets UTC del dashboard; además
  fallaría para usuarios en otras zonas.
- Fijar `timeZone: 'UTC'` en el formato y etiquetar "UTC": muestra una hora
  que ningún cliente espera ver en una tienda.
- Fijar `timeZone: 'America/Caracas'`: hardcodea una zona en contra del
  mercado global del producto.

## Consecuencias

- Todas las fechas se ven en la hora local del navegador, en cualquier zona.
- Sin cambios de contrato API, sin migraciones, sin dependencias nuevas.
- Tests: `formatted-date.test.tsx` (6 casos, incluyendo que el SSR solo
  emite el ISO crudo y ningún texto formateado en zona del servidor).
