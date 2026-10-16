# 0056 — Filtro de pedidos por cliente (admin)

Fecha: 2026-10-16

## Contexto

La lista de pedidos del admin solo filtraba por estado. Se pide buscar
por el nombre del usuario que hizo el pedido.

## Decisión

- Buscador de texto en la tarjeta de filtros (mismo patrón que el `q`
  de productos/documentos: borrador local, va en la URL y el servidor
  re-fetch). Limpia junto con el resto de filtros.
- Como el filtro por nombre de categorías: aplica **mientras se
  escribe**, sin Enter. Los pedidos son paginados en servidor (a
  diferencia de la lista completa de categorías, filtrada en cliente),
  así que las teclas se agrupan con un debounce de 400 ms en una sola
  navegación; Enter aplica de inmediato.
- Envía `q` al backend (ADR backend 0058: coincide nombre o correo).
- Claves i18n `admin.orders.customerFilter` (etiqueta) y
  `admin.orders.customerSearchPlaceholder`; sin duplicar textos.

## Consecuencias

- Combinable con el filtro de estado y la paginación (resetea a
  página 1 al cambiar).
