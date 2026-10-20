# 0066 — Kill-switch de IA en el storefront (aiEnabled)

Fecha: 2026-10-20
Estado: aceptado

## Contexto
El backend expone `aiEnabled` en `GET /api/v1/config/public` (var `AI_ENABLED`).
Con `false` hay que ocultar el asesor de compras (widget y página), el
asesor de soporte, el comparador y el asesor en detalle de producto,
informando al usuario. El admin no se toca.

## Decisión
- `lib/api/public-config.ts` valida `aiEnabled` (default `true` para
  compatibilidad con backends anteriores).
- Las páginas servidor (`asesor`, `soporte`, `comparar`, detalle) leen el flag
  y, si es `false`, renderizan un `Card` del sistema de diseño con el aviso
  i18n en vez del contenedor IA (sin ningún fetch). El comparador se oculta
  por completo con su mensaje propio ("El comparador de productos no está
  disponible en estos momentos").
- `AdvisorFab` recibe `enabled` y retorna `null` con la IA apagada.
- Red de seguridad cliente: `classifyAdvisorError` mapea `403` a `disabled`;
  `product-advisor`, `support-assistant` y `advisor-chat` muestran el aviso
  i18n si el backend responde 403 (p. ej. config cacheada).
- Nuevas claves i18n: `advisor.disabled`, `chat.disabled`,
  `support.disabled` ("Esta funcionalidad no está disponible en estos
  momentos" / "This feature is currently unavailable") y
  `compare.page.disabled` (mensaje propio del comparador).

## Alternativas consideradas
- Variable `NEXT_PUBLIC_*` duplicada: descartada, la fuente de verdad es el
  backend (AGENTS §3.5).
- Ocultar solo el resumen IA del comparador manteniendo la tabla: descartado
  por decisión de producto (nada visible).

## Consecuencias
- Sin llamadas a `/api/advisor/*` cuando el flag es `false` (las páginas no
  montan los contenedores).
- Las políticas de soporte (texto estático) siguen visibles; solo se oculta
  el asistente.
