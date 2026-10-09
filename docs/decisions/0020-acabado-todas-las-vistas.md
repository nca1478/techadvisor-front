# 0020 — Acabado marketplace en todas las vistas

Date: 2026-10-09
Status: accepted

## Context

El tema 0019 cubrió chrome, tarjetas y fichas; el resto de vistas
(checkout, cuenta, admin, auth, búsqueda, estados) seguía con el acabado
básico. Esta tarea lo extiende sin cambiar funcionalidad ni contratos.

## Decisiones

1. Hero asesor en banda navy (`bg-header`, radio `xl` para jerarquía):
   es EL elemento memorable; badge amarillo, título blanco, tarjeta de
   respuesta blanca para legibilidad, CTA amarillo. Todo lo demás quieto.
2. Checkout con indicador de pasos (Dirección → Pago → Confirmación):
   la única numeración permitida porque el flujo ES una secuencia.
   `CheckoutSteps` presentacional con `aria-current="step"`.
3. Totales con hairline superior + cifra en negrita (`OrderSummary`,
   `CartSummary`): el divisor informa, no decora.
4. Evidencia de búsqueda con acento lateral (`border-l-2
   border-primary`): marca qué texto justifica el resultado.
5. Filtros del listado dentro de `Card`: panel toolbar sobre el gris.
6. Tira de miniaturas con scroll horizontal en móvil (ancho fijo por
   thumb) en vez de rejilla comprimida.
7. Tablas densas: thead con fondo de página + zebra en filas. Mismo
   patrón en cuenta y admin.
8. Auth en `Card` estrecha; tile de categoría con `hover:shadow-md`;
   resumen de orden en `Card` en la página de estado.
9. Sin estrellas/ranking (sin datos), sin fuentes nuevas, sin rutas
   nuevas. 6 claves de mensajes (pasos × 2 idiomas × 2 secciones).

## Dependencias (verificación obligatoria)

- Context7 disponible en la sesión; solo primitivas y tokens propios.
  Sin `npm install`, sin versiones que registrar.
