# 0014 — Header con categorías y contador + footer real + miniatura en carrito

Date: 2026-10-08
Status: accepted

## Context

La home ya tiene hero del asesor (ADR 0013), pero el chrome sigue mínimo:
el header no muestra categorías, el carrito no indica unidades y el footer
es una sola línea. El contrato `CartItemDto` ya expone `imageUrl` y `slug`,
así que la miniatura no requiere cambios de backend.

## Decisiones

1. Fila de categorías en el header con datos reales (`listCategories`,
   con fallback silencioso a fila oculta si la API falla). Sin barra
   promocional: sería copy de marketing inventado sin requisito que lo
   pida; se elige lo más simple.
2. Contador del carrito leído del `CartProvider` existente (sin fetch
   nuevo): enlace + `Badge` solo cuando el conteo es conocido y mayor que
   cero; en carga/error, enlace plano sin salto de layout.
3. Footer de tres columnas (marca, tienda, cuenta) enlazando únicamente a
   rutas que ya existen (`/productos`, `/buscar`, `/carrito`, `/ingresar`,
   `/registro`, `/cuenta`). Sin páginas inventadas.
4. Miniatura en `cart-line` con `MediaFrame` (placeholder automático si no
   hay imagen) enlazada al detalle vía `slug`. Derivada de props existentes
   (`locale`, `item`): sin cambios de firma ni de contrato.

## Dependencias (verificación obligatoria)

- Context7 disponible en la sesión; no se necesita ninguna librería nueva
  (primitivas `Badge`, `Grid`, `MediaFrame`, `Link` + contexto existente).
  Sin `npm install`, sin versiones que registrar.

## Consequences

- El layout hace una lectura extra (`listCategories`) por página; al ser
  servidor y tolerante a fallos, no rompe la página si el backend cae.
- `cart.line.productLink`, `nav.allProducts`, `nav.cartWithCount` y la
  sección `footer` deben mantenerse en sync es/en.
