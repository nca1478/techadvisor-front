# 0063 — Buscar: filtros de marca, orden y stock + Limpiar a la derecha

Date: 2026-10-19
Status: accepted

## Context

La pantalla "Buscar" mostraba solo consulta, categoría y precio máximo, con
"Limpiar filtros" junto a "Aplicar". Se piden los filtros de productos
(marca, ordenar, solo en stock) y "Limpiar filtros" en la esquina derecha.

## Decisiones

1. `SearchFilters` replica el orden del listado: consulta, categoría,
   marca, ordenar, precio máximo; fila inferior con `Aplicar` + checkbox
   a la izquierda y `Limpiar filtros` (`justify-between`) a la derecha,
   como en `ProductFilters`. Se mantiene `Aplicar` porque Buscar no
   aplica al escribir (reescribe la URL bajo demanda).
2. Nuevas claves bajo `search.*` (`brandLabel`, `allBrands`, `sortLabel`,
   `sortNone`, `sort <x>`, `inStockOnly`) con los mismos textos que
   `catalog.*`; la página compone `brand`/`sort`/`inStock=1` en la URL y los
   envía a la API. `sort` reusa el tipo `ProductSort` del catálogo.
3. `SearchView` hidrata marcas vía `catalog.listBrands()` y cuenta los
   filtros nuevos en el badge del acordeón. Sin librerías nuevas.
