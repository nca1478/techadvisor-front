# 0036 — Rango Hoy/7d/30d + barras de ventas en el dashboard

Fecha: 2026-10-13
Estado: aceptado

## Contexto

El dashboard P0 (ADR 0035) calculaba KPIs sobre los últimos 20 pedidos sin
dimensión temporal. Se pide filtro de rango + gráfico de ventas, solo
frontend, sin endpoint nuevo ni dependencias.

## Decisión

- Rango en URL (`?range=today|7d|30d`, defecto `7d`; valor inválido cae al
  defecto): compartible y server-rendered. Selector con pills `Button`
  existentes (activo = primary), sin estado cliente.
- La página traduce el rango a `from`/`to` ISO UTC y los pasa al
  `GET /admin/orders` existente (filtra `createdAt`, `total` respeta filtros,
  verificado en `admin.service.ts`). El KPI de pedidos pasa a ser exacto por
  rango; ingresos/ticket/gráfico se calculan sobre la muestra (límite 100,
  máximo del backend) con etiqueta honesta (`Muestra de X de Y pedidos`).
- `today` agrupa por hora UTC (24 buckets), `7d`/`30d` por día UTC, con
  huecos a cero para continuidad. Solo pedidos cobrados y en la moneda modal
  (misma regla que ADR 0035).
- Barras con `div` + altura en `%` (dato dinámico, único `style` inline) y
  color del token `bg-primary`; sin librerías de charts. Cada barra es
  `role="img"` con `aria-label "12 oct · 450,00 US$"` y `title` como tooltip;
  etiquetas del eje visibles por pasos (1/4/5) y resto `sr-only`.
- La cola operativa sigue siendo global (stock/reviews/docs/asesor son estado
  actual, no rango): no se filtra por fecha.
- Se elimina la card-tabla `Poco stock`: duplicaba la cola operativa (misma
  captura del usuario). El error de carga de productos se conserva como alerta
  dentro de la card de cola. Claves i18n antiguas se mantienen (sin uso).
- Sin nuevas dependencias: no se instala nada (context7 no aplica).

## Consecuencias

- Con >100 pedidos en el rango, gráfico e ingresos son parciales (etiquetado).
  El endpoint agregado `GET /admin/metrics/overview` (P1) lo resolverá.
- Buckets en UTC; el admin ve horas/días UTC en el gráfico (aceptable en P1,
  documentar si se quiere zona del navegador).
