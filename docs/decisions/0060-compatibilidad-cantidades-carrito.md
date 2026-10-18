# 0060 — Compatibilidad del carrito con cantidades (`items`)

- Estado: aceptado
- Fecha: 2026-10-18
- Contexto: el carrito enviaba solo `productIds` únicos a `POST /api/compatibility/check`, así que cambiar `qty` en el stepper no cambiaba el veredicto. No había aviso para 3x SATA en placa de 2 puertos, etc.
- Decisión: `useCompatibility` ahora recibe `[{ productId, qty }]` del carrito, usa clave `productId:qty` (re-chequea al cambiar cantidades) y envía `{ items, locale }` al BFF (que reenvía sin transformar). `cart-page-container` deriva `items` de `cart.items`. Mock e2e (`mock-backend.mjs`) y tipos OpenAPI (`CompatibilityCheckItemDto`) actualizados en sync con backend. Nueva suite Playwright `e2e/cart-compatibility-qty.spec.ts` (SATAx3, RAMx3, M2x2).
- Alternativas: expandir en frontend repitiendo ids (rechazado: el backend valida sin duplicados); ignorar qty (bug actual).
- Consecuencias: veredicto cambia al tocar el stepper; el gate de checkout (bloqueo solo con `error`) se mantiene.
