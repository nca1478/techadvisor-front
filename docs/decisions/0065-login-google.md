# 0065 — Login con Google en el frontend

- **Estado:** aceptado.
- **Fecha:** 2026-10-19.

## Contexto

La pantalla de login (`[locale]/ingresar`) debe ofrecer "Continuar con Google"
debajo de "Iniciar sesión" (ver backend ADR 0077). Sin librería nueva: GIS se
carga por `<Script>` y el BFF guarda los tokens en cookies httpOnly como el
login local. Textos vía diccionarios `es/en`, sin hardcodear.

## Decisión

- `GoogleSigninButton` (`features/auth/components/`): presentacional, renderiza
  el botón oficial GIS (`renderButton`) para cumplir branding; `null` si
  `NEXT_PUBLIC_GOOGLE_CLIENT_ID` está vacío (login local intacto).
- `LoginContainer`: divisor + botón Google entre el formulario local y el CTA
  de registro; `loginWithGoogle(idToken)` en `session-context` hace
  `POST /api/auth/google` + merge de carrito + `refresh()`, igual que `login`.
- BFF `app/api/auth/google/route.ts`: espejo de `login/route.ts` (proxy a
  `POST /auth/google` del backend, setea cookies httpOnly).
- Env: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (pública por diseño GIS) en
  `.env.example`; mismo valor que el backend `GOOGLE_CLIENT_ID`.
- Tipos regenerados con `npm run api:types` (`GoogleLoginRequestDto`,
  `UserResponseDto.provider`); mock Playwright `e2e/mock-backend.mjs`
  responde `/auth/google` con usuario `provider GOOGLE`.

## Consecuencias

- Sin `NEXT_PUBLIC_GOOGLE_CLIENT_ID` el botón se oculta (dev/CI sin Google).
- El usuario asigna el Client ID web manualmente (orígenes JS autorizados).

## Nota 2026-10-19 — popup en vez de One Tap

El botón dispara `oauth2.initTokenClient(...).requestAccessToken()` (popup
con `prompt: 'select_account'`): el selector de cuenta funciona en móvil,
donde `id.prompt()` no se muestra de forma fiable. `loginWithGoogle` envía
`{ accessToken }` al BFF (sin cambios en la ruta, proxy raw).

## Nota 2026-10-20 — redirect a pantalla completa en vez de popup/bubble

El popup (ventana aparte) y el bubble One Tap (`id.prompt()`, tarjeta pequeña
arriba a la derecha) no sirven en móvil: el bubble se recorta y el popup lo
bloquean los navegadores. El botón ahora usa `oauth2.initTokenClient` con
`ux_mode: 'redirect'` + `prompt: 'select_account'`: la pestaña completa navega
al selector de cuentas de Google (grande, usable en cualquier viewport) y
Google vuelve a `/{locale}/ingresar` con `#access_token=…&state=<next>` en el
fragmento. `LoginContainer` canjea el token con `loginWithGoogle({ accessToken })`
y sigue `state` (validado same-site). Sin GIS cargado hay fallback a la URL
OAuth manual. Requisito: registrar `http://localhost:3000/<locale>/ingresar`
(y la URL de producción) como redirect URI autorizado del Client ID web.

## Nota 2026-10-20 — el popup seguía apareciendo: `ux_mode: 'redirect'` no existe en el token client

La nota anterior asumía que `oauth2.initTokenClient({ ux_mode: 'redirect', redirect_uri })`
hacía la navegación de pestaña completa, pero esos dos campos solo existen en
`initCodeClient` (flujo de código de autorización); el *token client*
(flujo implícito) los ignora en silencio y siempre abre una ventana popup real
con su propia barra de título — justo lo que se veía en producción. Se quitó
la carga del script GIS (`accounts.google.com/gsi/client`) y el uso de
`initTokenClient`; el botón ahora navega siempre con
`window.location.assign` a la URL OAuth2 manual (`response_type=token`), que
sí es una navegación real de pestaña completa sin ventana aparte.

## Nota 2026-10-20 — flash del formulario vacío: callback dedicado

Con el redirect volviendo a `/ingresar` mismo, el servidor no puede ver el
fragmento `#access_token=…` (nunca llega al backend), así que el SSR de esa
ruta siempre pinta el formulario de login vacío/sin rellenar; ese HTML se
pinta en el navegador antes de que React hidrate y reaccione al hash — el
"flash" que se veía tras elegir la cuenta de Google. Se creó una ruta
dedicada `/{locale}/ingresar/callback`
(`app/[locale]/ingresar/callback/page.tsx` +
`GoogleCallbackContainer`) cuyo único contenido SSR es un spinner; el botón
ahora apunta `redirect_uri` ahí (`GoogleSigninButton.redirectPath`) en vez de
a la página de login. El callback canjea el token con `loginWithGoogle`,
seguido de `router.replace(state ?? '/{locale}/cuenta')`, o
`router.replace('/{locale}/ingresar?error=access_denied')` en error/cancelación
(que `LoginContainer` muestra vía `googleInitialError`). `LoginContainer`
volvió a su forma simple: ya no maneja el hash ni un estado "pending" propio.
Requisito: agregar `http://localhost:3000/<locale>/ingresar/callback` (y la
URL de producción equivalente) como redirect URI autorizado — la anterior
`/<locale>/ingresar` puede quitarse de la lista.
