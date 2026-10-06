# 0007 — Auth, carrito y checkout en el frontend (BFF + Stripe Checkout)

Fecha: 2026-10-06
Estado: aceptado

## Contexto

El backend emite los tokens de auth en el cuerpo JSON (sin cookies propias) y
el carrito de invitado viaja en la cookie httpOnly firmada `sid` (dominio del
backend). El navegador habla con la API en otro origen (`:3001`), donde el
CORS no permite credenciales: un `fetch` directo perderia la cookie `sid` y
obligaria a guardar tokens en almacenamiento legible por JS.

## Decisión

1. **BFF con cookies httpOnly**: las rutas `src/app/api/*` reenvian al
   backend, inyectan `Authorization: Bearer` desde la cookie `ta_access` y
   reenvian la cookie `sid` en ambos sentidos. El navegador solo ve
   `{ authenticated, user }` y carritos/ordenes; jamas los tokens.
2. **Refresh transparente**: ante un 401 con `ta_refresh` disponible, el BFF
   rota el par (`POST /auth/refresh`) y reintenta una vez. Merge del carrito
   invitado tras login/registro (`POST /cart/merge`).
3. **Totales solo del servidor**: carrito, resumen y orden muestran
   `totalAmount`/`lineTotalAmount` del backend; el cliente nunca suma dinero.
4. **Stripe Checkout alojado**: `POST /payments/checkout` devuelve
   `checkoutUrl` y el navegador redirige alli. No se maneja tarjeta y
   **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` no se usa** (no hay Stripe.js).
5. **Verdad del pago = webhook**: `/checkout/exito` consulta la orden real con
   polling acotado (2.5 s × 24). `PENDING_PAYMENT` muestra "procesando pago".
6. **URLs de retorno**: el backend fija `/checkout/success?session_id=…` y
   `/checkout/cancel?orderId=…` (sin locale). Esas rutas reenvian a las
   paginas localizadas `/[locale]/checkout/exito|/cancelado?orderId=…`; el
   `orderId` del flujo success se recupera del guardado previo al redirect
   (`localStorage ta_last_order_id`).

## Consecuencias

- Sin token en JS: XSS no roba sesion via `localStorage`.
- El BFF es el unico que habla con `API_BASE_URL` usando secretos/cookies.
- Cambiar el proveedor de pago solo toca el backend; el frontend solo exige
  `{ checkoutUrl }`.
