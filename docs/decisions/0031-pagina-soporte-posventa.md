# 0031 — Página de soporte posventa (`/[locale]/soporte`)

## Contexto

Fase 6 del plan (backend: ADR 0036, `POST /api/v1/advisor/support`): la tienda
necesita una página de soporte con el asistente posventa y enlaces a las
políticas completas. Rigen las convenciones del frontend (Container/Presenter,
textos en `src/messages`, sin fetch en `components/ui/`, tokens del sistema
de diseño) y el contrato vía OpenAPI (sin código compartido con el backend).

## Decisión

1. **Ruta `/[locale]/soporte`** (slug español fijo como `asesor`/`buscar`,
   para ambos idiomas): página de servidor con el asistente + las 5 políticas
   completas (garantía, envíos, devoluciones, pagos, privacidad) en tarjetas
   con ancla (`#politica-<id>`) y un índice de enlaces arriba. Los textos
   viven en `src/messages/<locale>.json` (`support`), nunca hardcodeados.
2. **Contenido duplicado a propósito, marcado como plantilla.** Las políticas
   son un espejo resumido de `backend/docs/content/policies/` (mismos hechos:
   2/3/1 años de garantía, 30 días de devolución, etc.) con el aviso de
   plantilla visible. No hay endpoint que las sirva: la opción más simple
   frente a un `GET /policies` nuevo, suficiente para contenido estático de
   ejemplo. Si el negocio las edita en el backend, el espejo se actualiza a
   mano (un solo lugar por idioma).
3. **Feature `src/features/support/`** (Container/Presenter): el contenedor
   `SupportAssistant` posee estado y POST a `/api/advisor/support` (con
   `orderId` opcional, solo enviado cuando no está vacío); `SupportView`
   renderiza con props. Reutiliza `AdvisorAnswer` para las citas (mismo
   contrato `{ answer, citations[], abstained }`). Errores: 404 → pedido no
   encontrado en tu cuenta (en este endpoint el 404 solo sale de órdenes),
   401 → iniciar sesión, resto como el widget de producto.
4. **BFF `src/app/api/advisor/support/route.ts`** como proxy (`proxyToBackend`
   hereda auth `ta_access` + `sid`, con rotación de refresh), igual que
   `product-qa`. Cliente `askSupport` en `src/lib/api/advisor.ts`.
5. **Descubrimiento:** enlace en el footer + `supportHref` del widget de
   producto apunta a `/soporte` (antes `/cuenta`); ruta incluida en
   `sitemap.ts` con alternates por idioma.
6. **Hidratación del pedido sin PII:** el frontend envía como máximo el
   `orderId` (UUID que el usuario copia de su cuenta); el backend resuelve el
   estado desde SQL y nunca recibe email ni dirección.

## Alternativas consideradas

- Nuevo `GET /policies` en el backend para no duplicar textos: rechazado —
  un endpoint más + ingesta leída en caliente por un contenido estático de
  ejemplo; el espejo manual es más simple y queda registrado aquí.
- Reutilizar `ProductAdvisor` tal cual: rechazado — necesita `productId` y
  preguntas sugeridas de producto; el soporte pregunta sin producto y con
  pedido opcional.

## Consecuencias

- Sin dependencias nuevas. Tipos regenerados con `npm run api:types`.
- Tests unitarios del contenedor (fetch simulado) + Playwright con mock.
