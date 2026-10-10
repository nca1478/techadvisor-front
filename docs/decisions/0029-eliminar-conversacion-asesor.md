# 0029 — Eliminar conversaciones del asesor (frontend)

Fecha: 2026-10-10
Estado: aceptado

## Contexto

El historial (ADR 0028) solo crecía: no había forma de borrar una
conversación guardada. El backend añade `DELETE /advisor/sessions/:id`
→ `204` (ADR 0033 del backend, borrado físico con cascada a mensajes).

## Decisión

- BFF: `DELETE /api/advisor/sessions/:id` (`src/app/api/advisor/sessions/[id]/route.ts`)
  con `proxyToBackend`; `deleteSession()` en `createAdvisorApi`.
- UI en dos pasos (sin `confirm()` nativo): el botón "Eliminar conversación"
  (bajo el selector, solo con sesión actual) abre un grupo de confirmación
  ("¿Eliminar… definitivamente? No se puede deshacer." + "Sí, eliminar" /
  "Cancelar"). Durante el borrado se muestra "Eliminando…" y el selector,
  el compositor y los botones quedan deshabilitados.
- Al confirmar (`AdvisorChat.handleDeleteConfirm`):
  - `DELETE` al BFF; un `404` se trata como éxito (ya purgada o borrada en
    otra pestaña: el resultado local es el mismo); otro error muestra
    `chat.deleteError` sin tocar nada.
  - Se elimina el id del historial del navegador y de la lista; si era la
    actual, se muestra la superviviente más reciente (omitidas las purgadas)
    o se abre una nueva en blanco si no queda ninguna.
- i18n: `deleteChat`, `deleteConfirm`, `deleteConfirmButton`, `deleteCancel`,
  `deleting`, `deleteError` en `es`/`en`.
- Mock e2e: `DELETE /advisor/sessions/:id` elimina y responde `204` (`404` si
  no existe); nuevo test Playwright del flujo con confirmación.

## Consecuencias

- Borrado físico e irreversible (diseño del backend): la sesión y sus
  mensajes desaparecen; las filas de analítica con el id como campo plano se
  conservan a propósito.
- Sin cambios de esquema ni de contrato tipado local (el `schema.d.ts`
  generado se refresca con `npm run api:types` contra el backend real cuando
  se regenere de rutina).

## Cómo revertir

Quitar el bloque de borrado de `ChatWindow`, los estados/handlers `Delete*`
de `AdvisorChat` y el `DELETE` del BFF: el historial vuelve a ser solo
acumulativo (el endpoint del backend queda sin uso).
