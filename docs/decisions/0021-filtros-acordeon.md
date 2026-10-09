# 0021 — Filtros del listado en acordeón colapsable

Date: 2026-10-09
Status: accepted

## Context

El panel de filtros ocupaba toda la pantalla antes de ver productos.
Se pide colapsarlo en un acordeón para optimizar el espacio.

## Decisiones

1. Nueva primitiva `Disclosure` (Card + trigger con `aria-expanded` y
   región; chevron CSS que rota al abrir; badge opcional de conteo).
   Cerrado desmonta el contenido: seguro porque `ProductFilters` es
   controlado por la URL (`useListingQuery`), no pierde estado.
2. Colapsado por defecto (`defaultOpen=false`): la rejilla —el contenido
   prioritario— se ve primero en móvil y desktop con una sola interacción
   para filtrar. El badge numérico informa filtros activos con el panel
   cerrado.
3. Sin claves nuevas salvo `catalog.filtersTitle` (es/en). Sin cambios de
   lógica, contratos ni rutas. Solo afecta al listado (`/productos`); la
   búsqueda conserva sus filtros visibles.

## Dependencias (verificación obligatoria)

- Context7 disponible en la sesión; solo React y primitivas propias, sin
  SDKs de IA fuera de `modules/ai/adapters/` (no aplica: frontend).
  Sin `npm install`, sin versiones que registrar.
