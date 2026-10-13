# 0037 — Dashboard consume el overview exacto (2 fetches)

Fecha: 2026-10-13
Estado: aceptado

## Contexto

El backend expone `GET /admin/metrics/overview` (ADR 0043 del backend):
agregación exacta con bounds efectivos, ingresos por moneda, buckets en
moneda modal y cola operativa. El dashboard aún hacía 5 fetches y calculaba
muestras en el cliente.

## Decisión

- `admin/page.tsx` hace 2 fetches en paralelo: `orders?limit=5` (tabla) +
  `overview?from&to&granularity&lowStockThreshold=5` (todo lo demás). Se
  eliminan los fetches de productos (100), reviews, documents y advisor/metrics.
- El overview se valida con el guard `isMetricsOverview` (el BFF devuelve
  `unknown`); si falla, KPIs muestran `—`/vacíos y la cola alerta
  `No se pudo cargar` (mismo patrón existente, sin inventar datos).
- KPIs exactos por rango: ingresos = primera entrada de `revenue` (el backend
  ordena por importe desc), ticket = redondeo, pedidos = `ordersTotal`.
  La nota de muestra (`salesSampleNote`) queda sin uso; la etiqueta del KPI
  de ingresos muestra `rango · moneda · nº cobros`.
- Buckets del overview se etiquetan en el cliente con `formatBucketLabel`
  (hora UTC para `today`, día+mes para el resto, con fallback a la clave).
- Se podan los agregadores de muestra del cliente (`summarizeRevenue`,
  `averageTicket`, `countOutOfStock`, `isCollected`, `countOrderStatuses`,
  `buildSalesBuckets`, `DASHBOARD_ORDERS_LIMIT`) con sus tests; se conservan
  `parseDashboardRange`, `rangeBounds`, `attentionTotal` y el guard nuevo.
- El umbral de stock viaja como parámetro (`lowStockThreshold=5`, espeja
  `LOW_STOCK_THRESHOLD` por contrato, sin código compartido).
- Tipos OpenAPI: `npm run api:types` regenerado contra el backend en marcha
  (verifica que `AdminMetricsOverviewDto` llega al contrato). El regen trae
  además drift acumulado de formato del generador y los campos de comprador
  (`userName`/`userEmail`/`shipping`) que el `schema.d.ts` versionado aún no
  tenía: se acepta el diff grande porque el fichero anterior estaba obsoleto
  (sin esos campos no compilaban ni siquiera las vistas de órdenes) y la
  cabecera del fichero ordena regenerar en vez de editar a mano.
- Hallazgo del regen: `userName` se generaba como `Record<string, never>`
  porque su `@ApiProperty` no declaraba tipo (el union `string | null` se
  degrada a `object` en el schema). Se corrigió en el backend con
  `type: String` explícito (cambio solo-docs, ver ADR 0043) y se regeneró:
  ahora es `string | null` y las vistas que lo muestran compilan sin
  normalización extra.
- Sin dependencias nuevas: no se instala nada (context7 no aplica).

## Consecuencias

- 5 fetches → 2; ingresos, gráfico y cola exactos en cualquier rango.
- La satisfacción del asesor (%) desaparece del dashboard (sigue en
  `/admin/asesor`); la cola conserva el conteo de preguntas abiertas.
