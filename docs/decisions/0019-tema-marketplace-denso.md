# 0019 — Tema marketplace denso (dirección estilo Amazon)

Date: 2026-10-09
Status: accepted

## Context

Veredicto del usuario sobre la serie P1-Diseño: la UI sigue básica; solo
se rescata la funcionalidad. Pide explícitamente dirección estilo Amazon.
La brief manda sobre la calibración de defaults: se adopta el vernáculo
marketplace (header marino, página gris con tarjetas blancas, CTA
amarillo pill, links teal) con marca, textos e imágenes propios — nada
copiado del referente.

## Decisiones

1. Tokens (`globals.css`, único lugar con valores crudos): página
   `#E3E6E6`, superficie `#FFFFFF`, texto `#0F1111`, atenuado `#565959`,
   borde `#D5D9D9`, primario CTA `#FFD814`/`#F7CA00` con texto oscuro,
   link `#007185` con hover `#C7511F`, destructivo/oferta `#CC0C39`,
   header `#131921`/`#232F3E` con texto `#FFFFFF`/atenuado `#CCCCCC`.
   Contrastes verificados por cálculo el 2026-10-09 (todos ≥ 4.5 en texto,
   anillo ≥ 3 sobre claro y oscuro): botón 13.61, cuerpo 15.09,
   atenuado 5.63/7.07, link 5.67, link-hover 4.54, header 17.67,
   footer-links 8.45, ring 5.67/3.11, oferta 5.71.
2. `bg-background` significaba "papel blanco" en ~20 sitios (tablas,
   diálogos, filas, dropdowns): todos pasan a `bg-surface`. La página
   gris solo la pinta `body`.
3. Botones pill (`rounded-full`): el CTA amarillo pierde su forma de
   píldora sin el radio completo. Links (primitiva `Link` y variante
   `link` de `Button`) pasan a teal; el amarillo como texto sería
   ilegible.
4. Sin estrellas ni "más vendidos": el contrato no trae reseñas/ranking y
   no se inventan datos (llega con reseñas reales).

## Dependencias (verificación obligatoria)

- Context7 disponible en la sesión; solo tokens y primitivas propias, sin
  librerías nuevas. Sin `npm install`, sin versiones que registrar.
