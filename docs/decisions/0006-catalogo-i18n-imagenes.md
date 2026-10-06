# 0006 — Catálogo P1.10: i18n sin librería, imágenes externas y extensión del diseño

Date: 2026-10-06
Status: accepted

## Context

P1.10 construye la navegación del catálogo (home, `/productos`, `/productos/[slug]`)
sobre el sistema de diseño de P1.9 (ADR 0005) y el contrato OpenAPI del backend
(`GET /catalog/products`, `GET /catalog/products/:slug`,
`GET /catalog/categories`, `GET /catalog/brands`, `GET /config/public`).
Se exige: Container/Presenter, filtros sincronizados con la URL, imágenes con
fallback, responsive/accesible solo con tokens de P1.9, tests presentacionales,
e i18n con rutas `/es` y `/en`, mensajes por idioma y selector de idioma/moneda.

Versiones vigentes (verificadas el 2026-10-06 con `npm view` / tipos generados):

- Next.js `16.3.8`, React `19.2.8`, `openapi-typescript` `^7.13.0`, `zod` `^4.6.5`.
- Contrato regenerado con `npm run api:types` contra el backend local
  (`/catalog/*` + `PaginatedProductsDto`, `ProductDetailDto`, etc.).

## Decisiones

### D1 — i18n sin librería externa (diccionarios propios + segmento `[locale]`)

No se instala `next-intl` ni `react-intl`. Motivo: solo hay dos idiomas (`es`,
`en`), los mensajes del catálogo son pocos y estáticos, y el backend ya expone
`defaultLocale`/`supportedLocales` en `GET /config/public`. Añadir una librería
sumaría API, peso y superficie de actualización sin beneficio proporcional.

Implementación:

- `src/messages/{en,es}.json`: mensajes de UI por idioma, sin textos
  hardcodeados en componentes de la feature.
- `src/lib/i18n/config.ts`: `LOCALES = ['en', 'es']`, `DEFAULT_LOCALE = 'en'`
  (alineado con el backend; el frontend lo revalida en runtime contra
  `/config/public` y cae al default si difiere).
- `src/lib/i18n/dictionaries.ts`: `getDictionary(locale)` tipado con el
  diccionario inglés como referencia (`Dictionary` = forma de `en.json`).
- Rutas bajo `src/app/[locale]/...` con `generateStaticParams()` y validación
  del segmento (`notFound()` si el locale no es soportado). `middleware.ts`
  redirige `/` al default y antepone el locale cuando falta.
- `alternates.languages` + `hreflang` en `generateMetadata` de cada ruta
  localizada; `lang` del `<html>` sale del segmento.
- Selector de idioma y de moneda: componentes de cliente que navegan a la misma
  ruta con distinto locale (`/{locale}/...`, preservando query) y que guardan la
  moneda en query (`?currency=`) + `localStorage` (solo presentación; los
  importes siempre llegan del backend en unidades menores + ISO 4217).

Si el catálogo crece a más idiomas o a mensajes con pluralización/ICU compleja,
se reevalúa `next-intl` en un ADR nuevo.

### D2 — Imágenes externas vía `images.remotePatterns` desde env

Las `imageUrl` del catálogo son `https` externas (CDN/placeholders del seed).
`next/image` exige declarar los hosts. Decisión:

- `next.config.ts` lee `IMAGE_REMOTE_HOSTS` (lista separada por comas,
  p. ej. `cdn.example.com,placehold.co`) y la convierte a `remotePatterns`
  `https://**`. Por defecto se permite `placehold.co` (datos del seed) para que
  el listado funcione sin configuración.
- `.env.example` documenta `IMAGE_REMOTE_HOSTS` y `NEXT_PUBLIC_PLACEHOLDER_IMAGE`.
- Sin `images.domains` (obsoleto) y sin `unoptimized: true` (se quiere
  optimización del framework).

### D3 — Extensión mínima del sistema de diseño (sin estilos ad hoc en la feature)

La feature no define colores, tamaños ni espacios propios. Faltaban dos piezas,
que se añaden al sistema (ADR 0005, reglas R9/R10/R11) en vez de estilos locales:

1. `MediaFrame` gana `fallbackSrc` (defecto `/placeholder.svg`): si `src` está
   vacío o falla la carga (`onError`), muestra el placeholder local con el mismo
   `alt` (o el nombre del producto). Mantiene ratio fijo (evita saltos de layout)
   y `alt` obligatorio. Archivo local `public/placeholder.svg` neutro (sin marca).
2. Nueva primitiva `Select` (`src/components/ui/select.tsx`): `<select>` nativo
   con etiqueta visible, `aria-invalid`/`aria-describedby` para errores y altura
   mínima táctil 40 px, variantes `sm/md`, solo tokens (`border-border`,
   `bg-background`, `rounded-md`). Para los filtros/orden del listado.

No se añaden tokens nuevos: colores, radios, sombras y espaciados existentes
cubren las vistas del catálogo.

### D4 — Precios y moneda solo en presentación

`src/lib/money/format.ts` expone `formatPrice(amountMinor, currency, locale)`
con `Intl.NumberFormat(locale, { style: 'currency', currency })`. Los contenedores
pasan `priceAmount`/`currency` crudos; solo los componentes presentacionales
formatean. La moneda se lee de `/config/public` (listas) y del query/almacenamiento
local; nunca se convierte ni se calcula en el frontend.

### D5 — Carrito aún no funcional (hasta P1.11)

El botón "agregar al carrito" de tarjetas/detalle queda deshabilitado con aviso
localizado (`messages.*.catalog.addToCartUnavailable`), sin llamar a la API de
carrito. Así se cumple el criterio sin simular una compra.

## Consequences

- `npm run api:types` debe reejecutarse cuando cambie el contrato; los tipos
  versionados incluyen ya `/catalog/*`.
- Añadir un host de imágenes = actualizar `IMAGE_REMOTE_HOSTS`, sin código.
- Un tercer idioma = nuevo `src/messages/<locale>.json` + entrada en `LOCALES`
  (y `supportedLocales` del backend); sin cambios de lógica.

## Amendment 2026-10-06 — SVG remotos en `next/image`

Los hosts del seed (`placehold.co`) sirven las imágenes como `image/svg+xml`
y el optimizador de Next.js las rechaza por defecto (`dangerouslyAllowSVG is
disabled`), lo que rompía tarjetas y galería en runtime. Decisión: activar
`dangerouslyAllowSVG: true` con
`contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"`
en `next.config.ts` (recomendación literal de la doc de `next/image` en
`node_modules/next/dist/docs/.../02-components/image.md`). Es seguro aquí
porque los SVG vienen de generadores estáticos, nunca de subidas de usuarios,
y la CSP neutraliza scripts embebidos (`contentDispositionType` ya es
`attachment` por defecto). No se usa `unoptimized` para no perder la
optimización de las fotos reales (raster) del CDN.
