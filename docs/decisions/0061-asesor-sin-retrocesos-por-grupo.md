# 0061 — Asesor admin: no ofrecer retrocesos de triaje por grupo

Fecha: 2026-10-17
Estado: aceptado

## Contexto

Con filtro "Todos los estados", los grupos por frecuencia incluían filas
`RESOLVED` pero el panel mostraba "Revisar" (`→ IN_REVIEW`) por grupo. El
backend rechaza el retroceso con 400 y el mensaje crudo llegaba al banner
("Cannot move unanswered query from RESOLVED to IN_REVIEW").

## Decisión

- El grupo trae `statuses` (backend ADR 0060; `schema.d.ts` actualizado como
  haría `npm run api:types`).
- "Revisar" solo si el grupo contiene `NEW`; "Resolver" solo si no está
  totalmente `RESOLVED`; si no hay acción válida se muestra "Resuelta".
- El envío por grupo ignora los 400 de retroceso por fila (éxito parcial en
  buckets mixtos); otro error sigue mostrando el aviso de error.

## Consecuencias

- Sin cambios de textos (se reutilizan `updated`, `status_RESOLVED`).
- Compatible hacia atrás: sin `statuses` se usa el filtro de la URL.
