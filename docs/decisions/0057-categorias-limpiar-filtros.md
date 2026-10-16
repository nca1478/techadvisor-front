# 0057 — Botón limpiar filtros en categorías (admin)

Fecha: 2026-10-16

## Contexto

El filtro por nombre de categorías no tenía forma de limpiarse salvo
borrar el texto a mano; el resto de módulos admin (productos, pedidos)
tienen botón "Limpiar filtros".

## Decisión

- Botón secundario "Limpiar filtros" en la tarjeta de filtros de
  categorías (misma etiqueta `catalog.clearFilters`, sin claves
  nuevas). Vacía el borrador y vuelve a página 1.

## Consecuencias

- Ninguna: el filtrado sigue siendo en cliente e instantáneo.
