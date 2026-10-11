# 0034 — Moderación de reseñas en el panel admin

Fecha: 2026-10-11
Estado: aceptado

## Contexto

Las reseñas nuevas quedan `PENDING` y la lista pública solo muestra
`PUBLISHED` (ADR 0037 del backend): sin UI de moderación, el panel no podía
cerrar el ciclo y las reseñas quedaban invisibles. El backend ya exponía
`GET /admin/reviews` y `PATCH /admin/reviews/:id/status` (transiciones
PENDING → PUBLISHED|REJECTED, PUBLISHED → REJECTED, REJECTED → PUBLISHED).

## Decisión

- Ruta `/admin/resenas` (sin tilde, como `ordenes`): página server con
  filtro de estado por URL + paginación, que pide `GET /admin/reviews` vía
  `backendFetch` con las cookies del admin.
- Contenedor `admin-reviews-view.tsx` con tabla densa (fecha, producto,
  estrellas reutilizando `ReviewStars`, título + cuerpo, estado, acciones),
  diálogo `ConfirmDialog` antes de publicar/rechazar y `router.refresh()`
  tras mutar. Los botones reflejan las transiciones válidas (publicar solo
  si no es PUBLISHED, rechazar solo si no es REJECTED); el backend decide
  en última instancia.
- Entrada `Reseñas` en el nav del admin y claves `admin.reviews` en `es`/`en`.
- Sin librerías nuevas; el BFF `/api/admin/*` ya reenvía GET y PATCH.

## Consecuencias

- Publicar/refrescar re-sincroniza el documento REVIEW del corpus y el
  resumen de pros/contras en el backend (side effects existentes, best-effort).
- El `userId` del autor (admin-only en el DTO) no se muestra: no hace falta
  para moderar y se minimiza exposición.
