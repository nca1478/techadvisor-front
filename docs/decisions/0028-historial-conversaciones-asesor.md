# 0028 — Historial de conversaciones del asesor (frontend)

Fecha: 2026-10-10
Estado: aceptado

## Contexto

El chat (`AdvisorChat`) guardaba una sola sesión en `localStorage`
(`techadvisor:advisor-chat:{locale}`). El botón "Nueva conversación"
sobrescribía esa clave y limpiaba la vista: la conversación anterior seguía
en el backend pero la UI no ofrecía forma de volver a ella. El backend ya
expone `GET /advisor/sessions` (lista, solo autenticados) y
`GET /advisor/sessions/:id` (historial).

## Decisión

- BFF: añadir `GET /api/advisor/sessions` (`src/app/api/advisor/sessions/route.ts`)
  con `proxyToBackend`. Devuelve 401 a invitados (el backend exige JWT); el
  contenedor lo trata como "sin lista remota" sin mostrar error.
- Fuente del historial (simple, sin store global):
  - Autenticados: unión de la lista remota + ids del navegador (la remota manda).
  - Invitados: solo navegador (`techadvisor:advisor-chat:history:{locale}`,
    máx. 20 ids con vista previa del primer mensaje). La clave anterior de una
    sola sesión se migra una vez a la lista y se mantiene sincronizada como
    "sesión actual" por compatibilidad.
- `ChatWindow` (presentacional) añade un `<select>` con `historyOptions`,
  `currentSessionId`, `historyLoading` y `onSelectSession`. Las etiquetas se
  construyen en el contenedor: vista previa o "Conversación · fecha" + conteo.
- "Nueva conversación" crea la sesión y la pone al frente sin borrar las
  demás; seleccionar otra carga su historial (`GET :id`) y la pone al frente.
  Un 404 al restaurar/seleccionar elimina ese id del historial local
  (purga por retención o sesión ajena) en vez de dejar el selector bloqueado.
- Fallo de la lista remota (no 401/404): aviso no bloqueante con la nueva clave
  `chat.historyListError`; el chat sigue funcionando con el historial local.
- i18n: nuevas claves `historyLabel`, `historyLoading`, `historyEmpty`,
  `historyListError`, `conversationFallback` en `es`/`en`.
- Mock e2e (`e2e/mock-backend.mjs`): `GET /advisor/sessions` devuelve los
  resúmenes (nuevos primero), como el backend.

## Consecuencias

- Las conversaciones ya no se pierden al crear una nueva, para invitados y
  logueados, sin cambios de backend ni de esquema.
- La lista remota no trae vista previa: los títulos de sesiones ajenas a este
  navegador muestran fecha + conteo hasta que se abren una vez.
- Límite local de 20 sesiones; más allá se olvida el id (la sesión autenticada
  sigue listable por el backend al recargar).

## Cómo revertir

Quitar el `<select>` de `ChatWindow`, el estado `sessions` de `AdvisorChat` y
el `GET` del BFF: el contenedor vuelve a una sola clave y "Nueva conversación"
sobrescribe como antes.
