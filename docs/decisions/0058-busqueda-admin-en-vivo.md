# 0058 — Búsqueda admin en vivo con hook compartido + filtro por producto en reseñas

Fecha: 2026-10-16

## Contexto

Los buscadores de productos, inventario y documentos exigían Enter;
reseñas no tenía filtro por producto. Se pide el mismo comportamiento
que el filtro por nombre de categorías (filtra mientras se escribe).

## Decisión

- Nuevo hook `useDebouncedSearch` (`features/admin/lib`): borrador
  local + debounce de 400 ms en una sola navegación + Enter inmediato
  + `reset`. Lo usan pedidos, productos, inventario, documentos y
  reseñas, así el comportamiento es idéntico en los cinco.
- Reseñas: nuevo filtro por nombre del producto (`q`, etiqueta
  `admin.reviews.productFilter`), combinado con estado y paginación;
  backend en ADR 0059.

## Consecuencias

- Sin cambios visuales salvo el campo nuevo en reseñas; el resto solo
  cambia cuándo se aplica la búsqueda.
