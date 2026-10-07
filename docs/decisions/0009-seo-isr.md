# 0009 — SEO básico e ISR de páginas de producto (cierre Fase 1)

Fecha: 2026-10-07
Estado: aceptado

## Contexto

La Fase 1 exige SEO básico en producto y listado (metadata, JSON-LD,
sitemap, robots) e ISR con estrategia documentada. Las páginas ya
renderizan en servidor con datos de la API, pero `generateMetadata` solo
cubría `title`/`description`/canónicos relativos y no había `sitemap.xml`,
`robots.txt` ni revalidación.

## Decisión

1. **Origen canónico por configuración**: `NEXT_PUBLIC_SITE_URL`
   (defecto `http://localhost:3000`) en `src/lib/seo/site.ts`. Alimenta
   `metadataBase` (layout raíz), canónicos absolutos, OG y JSON-LD. Es
   pública por necesidad (viaja en el HTML) y no es un secreto.
2. **Metadata por página**: listado y detalle generan `title`,
   `description`, `alternates` canónico + `languages` (hreflang `en`/`es`),
   `openGraph` (`siteName`, `locale`/`alternateLocale`, imagen del producto
   en el detalle) y `twitter` (`summary` / `summary_large_image` con
   imagen). Todo con datos de la API; ante fallo, título de respaldo sin
   inventar contenido.
3. **JSON-LD `Product`** en `ProductDetailContainer` (tras el fetch, sin
   doble petición): `name`, `description`, `sku`, `image`, `brand` y
   `offers` con `price` (unidades mayores derivadas de `priceAmount` con
   `currencyFractionDigits`), `priceCurrency` y `availability`
   (`InStock`/`OutOfStock`). El dinero sale de la API, nunca del LLM.
4. **`src/app/sitemap.ts` / `src/app/robots.ts`**: el sitemap lista rutas
   por idioma más los slugs del catálogo (`lastModified` desde
   `createdAt`); si la API falla, degrada a entradas estáticas en vez de
   romper `/sitemap.xml`. `revalidate = 3600`. Robots permite todo y
   anuncia el sitemap.
5. **ISR**: `revalidate = 300` + `dynamicParams = true` solo en la página
   de detalle (render bajo demanda, revalidación cada 5 min). El listado
   queda SSR sin caché (depende de `searchParams`: filtros, orden,
   paginación) y carrito/checkout/cuenta/exito son `force-dynamic` por
   sesión. La frescura de precio/stock en la ficha puede retrasarse 5 min;
   es aceptable porque el carrito y el checkout leen datos vivos y el total
   se congela en el servidor.

## Consecuencias

- Cambiar el dominio de producción exige fijar `NEXT_PUBLIC_SITE_URL`.
- Subir el catálogo tarda hasta 1 h en aparecer en el sitemap y 5 min en
  fichas; si se necesita inmediatez, revalidar bajo demanda (fuera de
  alcance Fase 1).
