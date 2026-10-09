# 0024 — Hero de portada oscura con foto de nicho

Date: 2026-10-09
Status: accepted

## Context

El hero `home-advisor-hero` mostraba un mock del asesor (pregunta/respuesta
ilustrativa con picks) sobre banda navy (ADR 0013, 0020). Se pide reemplazarlo
por una portada centrada estilo referencia: fondo fotográfico del nicho,
titular + subtítulo con eslogan de compra que destaque el asesor tech, y un
botón al listado de productos en venta.

## Decisiones

1. Portada oscura centrada: foto decorativa de placa de circuito (Unsplash) con
   `<img>` plano (sin `next/image`, sin host remoto que configurar, con
   `referrerPolicy="no-referrer"`), base `bg-header` y velo `bg-header/75`
   para que el texto blanco sea legible aunque la foto falle.
2. Copy en nuevas claves `catalog.homeCoverBadge/Title/Subtitle/Cta` (es/en):
   eslogan de compra + asesor, CTA "Ver productos disponibles" que enlaza a
   `/[locale]/productos` (el listado real). Sin flechas, sin eyebrow en
   mayúsculas, sin numeración.
3. La portada lleva el único H1; se retira el bloque H1 de marca previo del
   `home-container` para no duplicar titulares. Las claves `homeAdvisor*`
   quedan sin uso hasta la Fase 3 (no se borran para no romper el shape es/en).
4. Solo tokens existentes (`header`, `primary`, `surface`) y primitivas
   (`Badge`, `Heading`, `Text`, `Button` secondary lg en píldora). Sin
   dependencias nuevas ni valores hex fuera de `globals.css`.

## Consequences

- Cuando llegue el asesor real (Fase 3), se añade un bloque separado conectado
  a `POST /api/v1/advisor/*`; la portada no cambia.
- La foto remota es decorativa (`alt=""`); si Unsplash falla, la portada
  degrada a banda oscura legible.
- La portada es full-bleed: se renderiza fuera del `Container`, como primer
  hijo de `main` (sin `Section` ni padding superior), con esquinas rectas, de
  modo que queda pegada al navbar y ocupa todo el ancho de la ventana. El
  resto de la home sigue dentro del `Container`.
