# 0062 — Filtros de búsqueda en acordeón colapsable

Date: 2026-10-19
Status: accepted

## Context

La pantalla de búsqueda mostraba los filtros (consulta, categoría,
precio máximo, Aplicar/Limpiar) siempre expandidos, ocupando el primer
plano antes de los resultados. Se pide meterlos en un acordeón como el
de la descripción del detalle de producto.

## Decisiones

1. Reutilizar la primitiva existente `Disclosure` (misma que la ficha de
   producto y el listado en ADR 0021): título + `aria-expanded`, cerrado
   desmonta el contenido. Sin librerías nuevas.
2. Nueva clave `search.filtersTitle` ("Filters"/"Filtros"), coherente con
   `catalog.filtersTitle`. Sin texto hardcodeado en la vista.
3. Colapsado por defecto (`defaultOpen=false`) con badge de conteo de
   filtros activos (consulta, categoría, precio), igual que el listado.
   Seguro porque `SearchFilters` es controlado por el estado del
   contenedor (`SearchView`), que sobrevive al colapso; igual que el
   argumento del ADR 0021 con la URL.
4. Alcance limitado a `SearchView`; sin cambios de lógica, contratos,
   rutas ni backend.

## Dependencias (verificación obligatoria)

- Context7 no requerido: solo React y primitivas propias (`Disclosure`,
  `SearchFilters`), sin SDKs de IA. Sin `npm install`, sin versiones
  que registrar.
