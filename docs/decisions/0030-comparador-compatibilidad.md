# 0030 — Comparador y avisos de compatibilidad en el carrito (frontend)

Fecha: 2026-10-10
Estado: aceptado

## Contexto

El backend expone `POST /advisor/compare` (tabla SQL + resumen citado +
veredicto determinista, ADR 0035 del backend) y `POST
/compatibility/check` (motor de reglas sobre `specs`, sin LLM). El
frontend debía darles UI: selector en el listado, página `/comparar` y
avisos en el carrito que no bloquean la compra.

## Decisión

- Tipos desde el contrato generado (`npm run api:types` ya incluye
  `Compare*Dto` y `Compatibility*Dto`); validación runtime local con Zod
  en `src/lib/api/compare.ts` y `src/lib/api/compatibility.ts` (patrón
  "mantener en sync con backend", como `advisor.ts`). La tabla generada
  trae `values: string[]` / `best: string[]` por inferencia de
  openapi-typescript, así que el Zod local es permisivo (`unknown[]`,
  `number[]`) según el contrato real del backend.
- BFF same-origin: `POST /api/advisor/compare` y
  `POST /api/compatibility/check` con `proxyToBackend`; el navegador
  nunca llama al backend directamente.
- Comparar: `CompareSelectionProvider` (máx. 3 ids en localStorage) en el
  layout localizado; `CompareToggle` por tarjeta, `CompareBar` con enlace
  a `/comparar?ids=` (la URL es la fuente de verdad: sobrevive a
  recargas y compartidos). La tabla resalta `best` (decidido por el
  backend con criterio objetivo) y el resumen muestra citas `[n]`
  expandibles. El `useCase` es un campo libre opcional (máx. 500).
- Carrito: `useCompatibility` consulta el check con los ids del carrito;
  `CompatibilityAlert` muestra errores/avisos con enlace al producto
  afectado. Los errores no bloquean: el botón de pago se deshabilita
  hasta marcar "He revisado los avisos…" (confirmación explícita que
  caduca si cambian los avisos). Si el check falla, la compra sigue (no
  se bloquea por un fallo de telemetría).
- Mock e2e: 4 fixtures (placa DDR5, RAM DDR4, CPU AM4, placa LGA1700) que
  no aparecen en el listado (para no romper los tests existentes) pero sí
  en detalle/carrito; handlers deterministas para ambos endpoints.

## Consecuencias

- Sin dependencias nuevas.
- La puerta del checkout vive en el carrito; navegar directo a
  `/checkout` con incompatibilidades no re-exige la confirmación
  (aceptado: el aviso ya quedó registrado en el carrito).

## Cómo revertir

Quitar el provider del layout, la ruta `comparar`, el bloque de
compatibilidad de `CartPageContainer` y los dos BFF: el flujo de compra
vuelve a no comprobar compatibilidad.
