# 0010 — E2E con API simulada: servidor mock propio en vez de interceptación

Fecha: 2026-10-07
Estado: aceptado

## Contexto

El cierre de la Fase 1 pide un smoke Playwright del flujo
registro → buscar/filtrar → carrito → checkout → orden pagada, con API
simulada en CI (sin backend real ni Stripe real). La suite anterior solo
cubría la home estática.

## Decisión

- **Servidor mock dedicado (`e2e/mock-backend.mjs`, Node sin
  dependencias)** en vez de `page.route`: el listado y el detalle hacen
  fetch a la API en el servidor (SSR) y la interceptación del navegador no
  ve ese tráfico. Un solo mock cubre SSR y los proxies BFF `/api/*`.
- **El mock implementa el subconjunto del contrato usado por el flujo**
  (`config/public`, `catalog/*`, `auth/*`, `users/me`, `cart/*`,
  `orders/*`, `payments/checkout`) con las formas de `schema.d.ts`. Tiene
  estado en memoria (un carrito, un usuario, N pedidos) y dos fixtures
  (`mock-laptop-13`, `mock-mouse-pro`) para que la búsqueda `q=laptop`
  discrimine.
- **Pago simulado**: `POST /payments/checkout` marca el pedido `PAID` y
  devuelve `checkoutUrl` same-origin hacia `/en/checkout/exito?orderId=`,
  ocupando el lugar del redirect a Stripe + webhook. El frontend sigue sin
  tocar datos de tarjeta y sin marcar pagados desde el cliente: en local
  contra el backend real, el `PAID` solo lo pone el webhook.
- **`playwright.config.ts`**: por defecto levanta el mock (`MOCK_PORT`,
  3002) y el dev server con `API_BASE_URL` y `NEXT_PUBLIC_API_BASE_URL`
  apuntando al mock (hay que fijar ambas: el cliente SSR prefiere la
  pública). `E2E_REAL=1` salta el mock para correr contra el backend real.
- **CI**: job `e2e` separado del job `ci` (lint/typecheck/test/build); el
  job `e2e` instala chromium y corre la suite sin servicios externos.

## Consecuencias

- Si el contrato cambia (p. ej. nuevos campos obligatorios), el mock debe
  actualizarse a mano; los specs e2e fallarán avisando.
- El mock no sustituye los e2e del backend (Supertest) ni pruebas con
  Stripe real; solo cubre el flujo web con respuestas con forma de
  contrato.
