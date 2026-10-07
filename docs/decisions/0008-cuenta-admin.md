# 0008 — Área de cliente y panel de administración en el frontend

Fecha: 2026-10-06
Estado: aceptado

## Contexto

El backend ya expone el panel (`/admin/*`, guard `ADMIN`) y los pedidos del
cliente (`/orders`), pero el `docs-json` publicado no describe cuerpos de
petición ni query params de admin, así que los tipos generados
(`schema.d.ts`) solo cubren las respuestas.

## Decisión

1. **Tipos de petición declarados en el frontend** (`src/lib/api/admin.ts`,
   validados con Zod en formularios): espejan 1:1 los esquemas del backend
   (`admin.schemas.ts`). El backend re-valida todo; el frontend solo
   pre-valida para UX. `ADMIN_ORDER_TRANSITIONS` espeja la máquina de estados
   del backend **menos `PAID` como destino** (restricción 7b: solo el webhook
   de Stripe marca pagado) y lleva `// mantener en sync con backend`.
2. **Proxy BFF genérico** (`src/app/api/admin/[...path]/route.ts`): reenvía
   método + query + cuerpo + cookies httpOnly al backend, que aplica el guard
   de rol. El guard del layout (`/[locale]/admin/layout.tsx`) solo mejora la
   experiencia (anónimo → login, CUSTOMER → tienda); la seguridad vive en el
   backend.
3. **Precios en unidades mayores en formularios** (`parseMajorToMinor` con
   `currencyFractionDigits` compartido con `formatPrice`): el admin escribe
   decimales y el cliente convierte a enteros en unidades menores.
4. **Paginación de pedidos de cliente en el navegador**: `GET /orders`
   devuelve el array completo y la vista pagina localmente (10/página); las
   tablas de admin usan la paginación del servidor vía URL.
5. **Traducciones en edición**: solo se envían si el bloque opcional está
   completo; si no, se omite la clave para no borrar el conjunto existente
   (el backend reemplaza todo el conjunto cuando está presente).
6. **Sin librerías nuevas**: tablas con `<table>` nativo + tokens, diálogos
   con `<dialog>` nativo, specs dinámicas desde `SpecFieldDto` del catálogo
   público.

## Consecuencias

- Cambiar un DTO del backend exige actualizar `lib/api/admin.ts` a mano
  hasta que el `docs-json` describa cuerpos y queries.
- Cambiar la máquina de estados del backend exige actualizar
  `ADMIN_ORDER_TRANSITIONS`.
