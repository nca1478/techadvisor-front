# 0039 — Filtros de inventario y enlace desde la cola operativa

Fecha: 2026-10-13
Estado: aceptado

## Contexto

La pantalla de inventario no permitía aislar los casos operativos (sin
stock, poco stock, con reservas) y la cola operativa del dashboard
enlazaba al inventario sin filtro. El backend expone ahora
`?stock=out_of_stock|low_stock|reserved` en `GET /admin/products`
(ADR 0045 del backend).

## Decisión

- `inventario/page.tsx` (server) lee `stock` de la URL (solo los tres
  valores válidos vía `isAdminStockFilter`, resto = sin filtro) y lo pasa
  al backend junto con `lowStockThreshold=LOW_STOCK_THRESHOLD` para que el
  "poco stock" coincida con los conteos del dashboard.
- `InventoryView` (client) añade `AdminFiltersCard` con un `Select`
  (Todo / Sin stock / Poco stock / Reservado) + botón limpiar, con el mismo
  patrón que productos/documentos: filtro en la URL, cambio de filtro
  resetea a página 1 y limpia el `productId` seleccionado (podría no estar
  en el listado filtrado), paginación y selección conservan el filtro.
- La cola operativa enlaza "Sin stock" a
  `inventario?stock=out_of_stock` y "Poco stock" a
  `inventario?stock=low_stock`; el resto de filas conservan sus destinos.
  `low_stock` incluye a `out_of_stock` (definición del backend), igual que
  los conteos del overview.
- Textos en `inventory.*` de `es.json`/`en.json` (nada hardcodeado).
- Sin dependencias nuevas.

## Consecuencias

- `AdminProductListQuery` gana `stock` y `lowStockThreshold`
  (`toAdminQuery` los serializa sin cambios); `isAdminStockFilter`
  normaliza la query entrante.
- Tests: `inventory-view.test.tsx` nuevo (filtro renderiza, cambia la URL
  y limpiar resetea) + hrefs de la cola en `dashboard-view.test.tsx`.
