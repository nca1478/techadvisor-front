# 0046 — Footer con estructura de referencia (marca + newsletter + 3 columnas)

Fecha: 2026-10-15
Estado: aceptado

## Contexto

El footer anterior era un `Grid` de 3 columnas genérico (marca, tienda, cuenta).
El usuario pidió la estructura de una referencia: bloque de marca con CTA
"subscribe to newsletter" y fila de sociales a la izquierda, tres columnas de
enlaces (PRODUCTS / HELP / COMPANY) a la derecha, sobre fondo negro con
divisoria superior e inferior.

## Decisión

- Estructura de la referencia, mundo visual Signal Lab intacto: fondo
  `bg-header`, texto `text-header-foreground`, divisoria `border-border`,
  titulares de columna en mono mayúsculas (`font-mono`, `tracking-widest`,
  `text-header-muted`), enlaces con la primitiva `Link` variante `header`.
- Columna izquierda: wordmark (rayo volt sólido + texto paper), `note`,
  `Button` primario a `/registro` como CTA de newsletter y 6 iconos sociales
  SVG propios (`ui/social-icons.tsx`, trazo 1.8, `currentColor`).
- Columnas con rutas reales existentes: PRODUCTS (productos, buscar, comparar,
  asesor), HELP (soporte, carrito, cuenta/ordenes), COMPANY (ingresar,
  registro, cuenta). Sin About/Blog/Press: no existen esas páginas y los
  enlaces rotos están prohibidos.
- Excepción al sistema: CTA en píldora (`rounded-full`). La regla Shape
  reserva la píldora, pero el brief de la referencia la exige y el brief gana.

## Alternativas descartadas

- Copiar los enlaces literales de la referencia (E-Mopeds, Press kit, Invest):
  llevan a 404; se mapearon a rutas reales.
- Iconos sociales como emoji o librería externa: prohibido por el craft floor;
  se dibujaron SVG en el mismo trazo del set de header.

## Pendiente

- Sociales apuntan a los home de cada plataforma (placeholder) hasta que la
  marca tenga cuentas propias.
- Newsletter real (captura de email + endpoint): hoy el CTA lleva a `/registro`.
