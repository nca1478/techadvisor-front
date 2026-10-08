# TechAdvisor — Frontend

Web Next.js (App Router) para el ecommerce B2C de tecnología TechAdvisor.
Corre en el puerto **3000** y habla con la API del backend vía
`API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` (conectado en una tarea posterior).

> Fuente de verdad: [`../AGENTS.md`](../AGENTS.md).
> Nota: el `AGENTS.md` de esta carpeta es guía vendor autogenerada de Next.js;
> la especificación del producto vive en el `AGENTS.md` de la raíz.

## Ejecución

```bash
npm ci
npm run dev      # http://localhost:3000
```

## Apuntar a la API local

La web habla con la API del backend vía `API_BASE_URL` (lado servidor) y
`NEXT_PUBLIC_API_BASE_URL` (lado navegador). Ambas apuntan por defecto a la
API local; aquí no hay servicios de base de datos (la infraestructura vive en
`backend/`).

```bash
cp .env.example .env.local    # una vez: crea tu env local (nunca lo commitees)
# .env.example ya apunta ambas variables a http://localhost:3001/api/v1
npm run dev                  # arranca primero el backend (ver backend/README.md)
```

> Nunca pongas secretos en variables `NEXT_PUBLIC_*` — quedan expuestas en el navegador.

## Scripts

| Script              | Qué hace                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | servidor de desarrollo (puerto 3000)                    |
| `npm run build`     | build de producción                          |
| `npm run lint`      | eslint                                    |
| `npm run typecheck` | `tsc --noEmit`                            |
| `npm test`          | tests unitarios / de componentes (vitest)           |
| `npm run test:e2e`  | smoke e2e (playwright, chromium)          |
| `npm run api:types` | regenera los tipos de la API desde el OpenAPI del backend |

## E2E

```bash
npx playwright install chromium   # una vez: descarga el navegador (CI usa --with-deps)
npm run test:e2e                  # API simulada: sin backend ni Stripe
```

La suite (`e2e/`) corre por defecto contra un backend simulado con forma de
contrato (`e2e/mock-backend.mjs`, arrancado automáticamente por
`playwright.config.ts`): tanto las páginas SSR como los proxies BFF `/api/*`
apuntan a él, y el mock simula la confirmación del pago (`POST
/payments/checkout` pasa la orden a `PAID` y devuelve un `checkoutUrl`
mismo-origen). Flujos cubiertos: compra completa (registro →
búsqueda/filtrado → carrito → checkout → orden pagada), metadata
SEO/JSON-LD/sitemap/robots y el smoke del home estático. Justificación en
`docs/decisions/0010-e2e-mock-estrategia.md`; estrategia SEO/ISR en
`docs/decisions/0009-seo-isr.md`.

### E2E contra el backend real (local)

```bash
# 1. Infra + API del backend (desde backend/):
docker compose up -d && npm run start:dev
# 2. Stripe en modo test con el CLI (desde backend/, ver backend/README.md):
stripe listen --forward-to localhost:3001/api/v1/payments/webhook
# 3. E2E del frontend sin el mock (desde frontend/):
E2E_REAL=1 npm run test:e2e
```

En modo backend real el checkout redirige al Stripe Checkout alojado (claves
de test): completa el pago con una tarjeta de prueba (p. ej. `4242 4242 4242
4242`), y la orden llega a `PAID` solo vía el webhook — el flujo entonces
depende de tiempos (entrega del webhook + el polling de estado de 2.5 s), así
que puede tardar un minuto. `E2E_REAL=1` reutiliza las URLs de API de tu
`.env.local`; el modo mock las sobrescribe automáticamente.

## Estructura

- `src/app/` — rutas (App Router)
- `src/features/` — módulos de funcionalidad (catalog, cart, checkout, advisor, account)
- `src/components/ui/` — componentes presentacionales genéricos (sin fetching aquí)
- `src/lib/api/` — cliente API + tipos generados desde el OpenAPI del backend
