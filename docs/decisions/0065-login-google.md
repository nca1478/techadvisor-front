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
