# ADR 0043: Retema Signal Lab — laboratorio oscuro premium

- Estado: aceptado
- Fecha: 2026-10-14
- Repo afectado: frontend

## Contexto

Auditoría `/impeccable` (2026-10-14) sobre Home, Catálogo, Producto y
Checkout encontró:

1. Clon visual de marketplace genérico (fondo `#e3e6e6`, CTA amarillo
   `#ffd814`, header `#131921`).
2. `Inter` como voz display (anti-patrón de la craft floor) y grises planos
   sobre color.
3. Pilas de tarjetas anidadas (`Card` dentro de `Card`).
4. Jerarquía de precio débil (mismo `text-lg` que el cuerpo, sin cifras
   tabulares) y CTA secundario en el hero.
5. Sin momento de motion propio: solo `transition-colors`; sin delight al
   añadir al carrito ni en imágenes.
6. Estados vacíos/error genéricos (caja centrada sin ilustración ni salida).

El usuario eligió: foco en comprador rápido 1-clic, mundo "laboratorio
oscuro premium", alcance sistema + 4 páginas clave.

## Decisión

Sistema "Signal Lab", solo con tokens semánticos existentes (sin nuevas
dependencias, sin cambios de lógica ni de contratos):

- Tinta oscura por defecto (`--background #0a0e13`, nunca negro puro);
  secundarios tintados del matiz de tinta, jamás gris.
- Una sola señal de conversión: lima volt `#c9f24b` (precio, CTA primario,
  foco). Cian reservado a asesor/enlaces; nunca compiten.
- Display: Chakra Petch (Google Fonts, OFL) vía `next/font` para
  headings/hero; Inter queda como cuerpo; JetBrains Mono para
  precios/specs/cantidades (dato, no disfraz).
- Precio en mono tabular (`Text variant="price"/"price-lg"`, utilidad
  `.price`); total de carrito/checkout en volt.
- Motion única con `cubic-bezier(0.22,1,0.36,1)`: zoom lab en imágenes,
  pop de confirmación en add-to-cart (auto-limpieza 2.2 s), shimmer en
  skeletons; todo anulado con `prefers-reduced-motion`.
- `Card ghost` pasa a transparente y se prohíbe anidar tarjetas;
  `Badge` en mono mayúsculas con borde de tono; `Stack` gana `baseline`.
- Hero reescrito como panel-instrumento alineado a la izquierda con tira
  de telemetría; estados vacíos con retícula SVG dibujada; checkout con
  conectores de paso y resumen sticky en desktop.

## Consecuencias

- Tests de `button`/`card` actualizados a los nuevos tokens (4 aserciones).
- Tema claro conservado solo como opt-in `[data-theme="light"]` para
  superficies que lo pidan; el storefront sirve oscuro.
- Riesgo: superficies no tocadas (admin, comparador, reseñas) heredan el
  mundo oscuro vía tokens; se revisan visualmente en la siguiente pasada.
