# 0027 — Asesor conversacional en el frontend (`/asesor`)

Fecha: 2026-10-10
Estado: aceptado

## Contexto

La Fase 4 del backend expone el asesor de compra conversacional en
`POST /api/v1/advisor/sessions/:id/messages` (cuerpo `{ content, locale?,
currency? }` sin `role`): responde JSON o SSE (`Accept: text/event-stream`
con eventos `delta` → `products` → `clarifyingQuestion?` → `done`), con
tarjetas hidratadas desde SQL y pregunta de aclaración cuando falta
presupuesto o categoría. El frontend solo tenía el widget de product-QA.

## Decisión

- Página `/[locale]/asesor` (server component con metadata `noindex`: es
  una conversación personal) + entrada en nav/footer + `AdvisorFab`
  flotante en el layout (se oculta en `/asesor` vía `usePathname`).
- Contenedor `AdvisorChat`: abre la sesión al montar (invitado vía `sid` y
  autenticado vía `ta_access`, ambos reenviados por el BFF sin código
  extra), guarda el id en `localStorage` (`techadvisor:advisor-chat:<locale>`)
  y restaura con `GET /api/advisor/sessions/:id` (parseo tolerante:
  `asAdvisorCitation`/`asRecommendProduct` descartan formas desconocidas).
  Sin sesión no se puede recomendar: el fallo de apertura muestra error con
  reintento en vez de simular conversación.
- Streaming SSE de punta a punta: BFF `POST .../messages` reenvía el
  `Accept` del navegador (`proxyStreamToBackend` en `lib/api/backend.ts`
  tubería bytes sin parsear, con el mismo refresh-and-retry y reenvío de
  `set-cookie`); el navegador parsea deltas con `streamRecommendation`.
  Si el servidor responde JSON en vez de SSE, se valida igual
  (`parseRecommendResponse`) y se entrega el texto completo (degradación,
  no error).
- Presentación: `ChatWindow` (`role="log"`, indicador `role="status"`,
  errores en `role="alert"` con reintento, chips que rellenan el input y
  devuelven el foco, nota de privacidad y disclaimer reutilizados del
  widget). `ProductCard` muestra precio/stock/imagen/enlace **solo** desde
  la tarjeta hidratada (`Intl.NumberFormat`); `reason` y respuestas se
  renderizan como texto plano con `AdvisorAnswer` (nunca HTML).
- Aclaración: la burbuja lleva insignia y aparecen `quickReplies` del
  diccionario (atajos editables como "Mi presupuesto es de 800 USD", no
  datos inventados: el usuario los confirma con Enviar). `starters`
  equivalentes en el chat vacío.
- Errores: `classifyAdvisorError` (429/not-found/503/red/g genérico); un
  404 con sesión rota la sesión una vez y reenvía sin duplicar la burbuja
  (la sesión pudo purgarse por retención o cambiar de dueño al
  iniciar/cerrar sesión).
- Mock e2e: sesiones con mensajes en memoria, `GET` historial, rama
  legacy `role+content` (201), rama recomendación con 2 tarjetas, sondas
  `clarify-probe`/`rate-limit-probe` y SSE real cuando se pide.

## Consecuencias

- Cada visita a `/asesor` sin sesión guardada crea una sesión (las
  anónimas las purga la retención del backend, igual que el widget).
- El `Accept` del navegador decide el formato: proxies intermedios que lo
  eliminen degradan a JSON (sigue funcionando, sin streaming progresivo).

## Cómo revertir

Quitar la página, el FAB y las rutas BFF `sessions/[id]*`: el widget de
product-QA y el resto del sitio no dependen del chat.
