# 0054 — Línea de tiempo del pedido en detalle (usuario y admin)

Fecha: 2026-10-16

## Contexto

El detalle del pedido (usuario en `cuenta/ordenes/[id]` y admin en
`admin/ordenes/[id]`) mostraba solo el `OrderStatusBadge` actual, sin
progreso. El usuario pidió una línea de tiempo con los estados
pagado / en preparación / cancelado / enviado / entregado.

## Verificación de estados (fuente de verdad)

`backend/src/modules/orders/order-status.ts` (`ORDER_TRANSITIONS`, ADR 0011):

```text
PENDING_PAYMENT ──► PAID ──► PROCESSING ──► SHIPPED ──► DELIVERED
       │              │           │
       └──────────────┴───────────┴──► CANCELLED
```

La lista del usuario omite `PENDING_PAYMENT` (pago pendiente), que es el
estado inicial real antes del webhook de Stripe. La línea de tiempo lo
incluye como primer paso; `CANCELLED` se trata como rama terminal
excepcional (no como paso lineal), porque sin historial por estado no se
puede saber desde dónde se canceló.

## Decisión

- Nuevo presentacional compartido
  `frontend/src/features/account/components/order-timeline.tsx`
  (`OrderTimeline`), usado por `OrderDetail` (usuario) y por
  `AdminOrderDetailContainer` (admin). Sin fetch dentro; solo props.
- Flujo lineal: `PENDING_PAYMENT → PAID → PROCESSING → SHIPPED →
  DELIVERED`. `CANCELLED`: muestra el flujo atenuado más un nodo final
  en tono `destructive` con nota aclaratoria.
- Etiquetas reutilizan `account.status_*` (sin duplicar); solo se agregan
  `account.timelineTitle`, `account.timelineLabel` y
  `account.timelineCancelledNote` en `es`/`en`.
- Visual adaptado al proyecto: mismo lenguaje que `CheckoutSteps`
  (pastilla `size-7 rounded-lg font-mono`, conectores `h-px w-8`,
  tokens `primary/success/destructive/border`, `flex-wrap`,
  `aria-current="step"` en `<ol>`). Sin colores hardcodeados ni texto
  hardcodeado; `CANCELLED` usa el tono `destructive` ya definido para el
  badge.

## Consecuencias

- Ambas vistas comparten el mismo componente y la misma interpretación
  de la máquina de estados (`// mantener en sync con backend` en el
  archivo).
- Cuando el backend exponga historial con fechas por estado, este
  componente podrá extender cada paso con su fecha sin cambiar la API.
