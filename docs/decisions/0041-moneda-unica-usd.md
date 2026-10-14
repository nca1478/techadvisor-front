# 0041 — Selector de moneda oculto en operación USD única

Fecha: 2026-10-14
Estado: aceptado

## Contexto

La tienda opera solo en USD por ahora; EUR se habilitará más adelante. El
header mostraba el desplegable de moneda (USD/EUR) en todas las vistas,
ofreciendo una opción sin uso operativo.

## Decisión

- `LocaleCurrencyControls` renderiza el selector de moneda solo cuando
  `currencies.length > 1`. Con moneda única no hay nada que elegir y el
  desplegable desaparece del header (home incluido).
- Sin cambios de contrato: el backend anuncia las monedas vía
  `GET /config/public`. Re-habilitar EUR es solo configuración
  (`SUPPORTED_CURRENCIES=USD,EUR` en el backend) y el selector reaparece
  solo, sin tocar código.
- La resolución de moneda (`resolveCurrency` → base USD) y el formateo
  (`formatPrice`) siguen intactos.

## Consecuencias

- Cambio presentacional + test en `locale-currency-controls.*`.
- Ningún estilo nuevo fuera de los tokens existentes.
