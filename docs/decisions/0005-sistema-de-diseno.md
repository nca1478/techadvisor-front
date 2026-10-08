# 0005 — Sistema de diseño global (tokens + primitivas)

Date: 2026-10-06
Status: accepted

## Context

Todas las vistas del frontend (Fase 1 en adelante) deben construirse con un único
sistema de diseño: tokens y primitivas reutilizables. Como inspiración de principios
se estudió el sitio de demostración `demo.cozycommerce.dev` (tienda de comercio
electrónico de demostración). Lo observado se describe aquí en términos abstractos,
con palabras propias, sin copiar textos, imágenes, marcas, tipografías propietarias
ni código del sitio de referencia.

Versiones vigentes verificadas con Context7 (2026-10-06):

- Tailwind CSS `^4` (`@tailwindcss/postcss`): la configuración vive en CSS con la
  directiva `@theme` (ya no hay `tailwind.config.js`); los tokens `--color-*`,
  `--font-*`, `--breakpoint-*`, etc. generan utilidades automáticamente.
- Next.js `16.3.8` (App Router): fuentes con `next/font/google` usando `subsets`,
  `display: 'swap'` y `variable` para exponerlas como variables CSS.

No se agrega ninguna librería de UI: las primitivas se construyen con Tailwind y
React. No se instala nada nuevo en esta tarea (sin dependencias que versionar).

## Observaciones abstractas del sitio de referencia

Recorrido en lectura (home, tienda con/sin barra lateral, detalle de producto,
carrito): estructura típica de tienda B2C con los siguientes principios.

1. **Tipografía:** una familia geométrica sin serifa para texto general y otra
   condensada/de display para titulares promocionales. Escala con pocos saltos
   (cuerpo base, subtítulo, titular de sección, titular hero). Pesos 400/500/600/700
   según jerarquía; interlineado compacto en titulares (~1.1–1.25) y amplio en
   cuerpo (~1.6). Precio destacado en semibold con precio anterior tachado junto a él.
2. **Espaciado y ritmo vertical:** escala de pasos múltiplos de 4 px; secciones
   separadas por un ritmo generoso (aprox. el doble del espaciado interno de los
   componentes). Separación interna de tarjetas moderada y uniforme.
3. **Layout:** contenedor central de ancho limitado (~1200–1280 px) con padding
   lateral; grilla de productos de 2 columnas en móvil que crece a 3–4 en escritorio;
   en la tienda con sidebar, columna de filtros (~1/4) + grilla de productos (~3/4).
4. **Navegación:** barra superior utilitaria (mensaje promocional + acceso/cuenta),
   cabecera principal con logo, buscador y acciones (cuenta, wishlist, carrito con
   contador), y fila de navegación por categorías. En móvil la navegación colapsa a
   un menú hamburguesa con drawer lateral. Pie con 3–4 columnas de enlaces,
   contacto, descarga de apps y métodos de pago, más barra inferior de copyright.
5. **Tarjetas de producto:** imagen sobre fondo claro uniforme, insignia de descuento
   o estado (p. ej. "40% OFF", "Out of Stock") superpuesta arriba a la izquierda,
   acción ("Add to Cart") que aparece junto a la imagen, nombre en 2 líneas como
   máximo, y fila de precio (actual + anterior tachado). Jerarquía: imagen >
   nombre > precio > acción.
6. **Imágenes:** proporciones cuadradas o 4:3 en tarjetas y categorías (miniaturas
   circulares en categorías), recorte centrado con fondo claro, galería en detalle
   con imagen principal + tira de miniaturas.
7. **Botones:** variante sólida oscura/primaria para acciones principales
   ("Purchase Now", "Checkout"), variante de borde para secundarias
   ("Continue Shopping") y botones de icono circulares para acciones de tarjeta.
   Tres tamaños aproximados (pequeño, medio, grande/hero), radios medianos
   (no píldora total en botones principales), estados hover con oscurecimiento y
   foco visible.
8. **Bordes y radios:** radios medianos en tarjetas (~8–16 px) y pequeños en
   insignias/controles (~4–8 px); bordes sutiles de 1 px en superficies claras,
   sombras suaves solo en tarjetas flotantes/drawers.
9. **Color (roles):** fondo blanco, texto principal casi negro, texto secundario
   gris medio, superficies gris muy claro para tarjetas/banner, borde gris claro,
   un primario oscuro saturado para acciones y enlaces, un acento cálido para
   promociones/insignias, y semáforo (verde stock/disponible, ámbar aviso,
   rojo error/sin stock). Contraste texto/fondo alto en cuerpo y precio.
10. **Responsivo:** breakpoints en ~640 / 768 / 1024 / 1280 px. En móvil: 1–2
    columnas de producto, filtros colapsados en drawer/acordeón, hero apilado
    (texto sobre imagen), cabecera compacta con iconos, tablas del carrito
    convertidas en filas apiladas.

## Decisiones (reglas adoptadas y su token/primitiva)

| # | Regla | Implementación |
|---|---|---|
| R1 | Tipografía con licencias abiertas servida por el framework, con fallbacks de sistema | `src/app/fonts.ts` (`Inter` + `JetBrains Mono` de Google Fonts, OFL) vía `next/font/google` con `variable`; `--font-sans` / `--font-mono` en `@theme` |
| R2 | Escala tipográfica cerrada: `xs/sm/base/lg/xl/2xl/3xl/4xl`; titulares con tracking ajustado y leading compacto, cuerpo con leading amplio | Primitivas `Heading` (niveles 1–4 → estilos fijos) y `Text` (variantes `body/small/caption`, sin `style` arbitrario) |
| R3 | Paleta semántica propia (no la identidad del referente): `background`, `surface`, `foreground`, `muted-foreground`, `border`, `primary`, `accent`, `ring`, `success/warning/destructive` (+ tintes `*-subtle` y `*-foreground`) | Variables CSS en `:root` + `@theme inline` en `globals.css`; dark mode preparado como bloque `[data-theme="dark"]` (sin implementar) |
| R4 | Contraste mínimo WCAG AA verificado por script (texto normal ≥ 4.5:1) | Pares verificados el 2026-10-06: cuerpo 17.99, atenuado 7.58, sobre primario 7.85, sobre acento 5.47, sobre éxito 5.02, sobre aviso 5.02, sobre error 6.47 (ver reporte de la tarea) |
| R5 | Espaciado en múltiplos de 4 px (escala base `0.25rem` de Tailwind); ritmo de sección `py-12 md:py-20`; separación de componentes `gap-4/6/8` | Primitivas `Section` (ritmo vertical), `Stack` y `Grid` (gaps del catálogo de tokens) |
| R6 | Contenedor central único `max-w-7xl` con gutters `px-4 sm:px-6 lg:px-8` | Primitiva `Container` (prop `size`: `md/lg/xl`, por defecto `xl`) |
| R7 | Grilla de productos `2 → 3 → 4` columnas (`base → md → lg`) | Primitiva `Grid` con variante `products` + `cols` configurable |
| R8 | Radios cerrados `sm/md/lg/xl/full`, sombras `sm/md/lg`, bordes 1 px `border-border` | Tokens `--radius-*` / `--shadow-*` en `@theme`; `Card` (variantes `default/outline/ghost`) |
| R9 | Botones con 4 variantes × 3 tamaños y estados hover/foco/deshabilitado/cargando; foco visible siempre con anillo `ring` + offset | Primitiva `Button` (`primary/secondary/ghost/link`, `sm/md/lg`, `loading`, accesible por teclado como `<button>`/`<a>`) |
| R10 | Enlaces con subrayado en hover y foco visible; imágenes siempre con `alt` y marco de aspecto fijo para evitar saltos de layout | Primitivas `Link` y `MediaFrame` (`square/video/ratio-4-3/wide`, `alt` obligatorio) |
| R11 | Formularios con etiqueta visible, mensaje de error asociado (`aria-describedby`/`aria-invalid`) y altura mínima táctil 40 px | Primitiva `Input` (`label`, `error`, `hint`, tamaños `sm/md`) |
| R12 | Sin valores mágicos: ningún componente de `src/components/ui` usa hex ni medidas arbitrarias; todo resuelve a tokens | Verificado con búsqueda (`grep`) en la tarea; los hex de `globals.css` son la *definición* de los tokens |
| R13 | Revisión visual sin exponer negocio: página `/design-system` solo fuera de producción (`notFound()` en `production`) | `src/app/design-system/page.tsx` con texto neutro de ejemplo (sin i18n aún: P1.10) |

## Consequences

- Las vistas P1.10+ deben usar exclusivamente estos tokens y primitivas; cualquier
  token nuevo se propone aquí primero (nueva entrada ADR si cambia la escala).
- El modo oscuro queda estructurado (`[data-theme="dark"]`) pero sin implementar
  ni interruptor; implementarlo es una tarea futura explícita.
- `next/font/google` descarga las fuentes en build (requiere red en build/CI).

## Addendum 2026-10-07 � b�squeda sem�ntica (P2.7)

- Input acepta labelHidden (etiqueta sr-only, asociada v�a htmlFor): la barra de b�squeda del header necesita etiqueta accesible sin ruido visual. No cambia la escala ni los tokens.
- La barra de sugerencias y la p�gina /buscar reutilizan Input, Select, Button, Card, Grid, ProductCard y los estados CatalogLoading/Empty/Error: ninguna vista define estilos propios fuera de utilidades de layout de la escala Tailwind ya usada en el proyecto.
