# 0011 — Imágenes de host no configurado: allowlist + boundary defensivo

Date: 2026-10-08
Status: accepted

## Context

Una imagen de producto con `https://speedlogic.com.co/...` rompía la home con:

> Invalid src prop on `next/image`, hostname "speedlogic.com.co" is not configured
> under images in your `next.config.js`

`next.config.ts` solo permitía `IMAGE_REMOTE_HOSTS=placehold.co` (ADR 0006, D2).
Además, el `onError` → `fallbackSrc` de `MediaFrame` no podía atrapar el fallo:
`next/image` lanza **síncronamente durante el render**, no como error de carga
asíncrono, así que una sola URL tumbaba la página entera (`ProductCardGrid` →
`HomeContainer`).

## Decisiones

1. **Fix inmediato (config, sin código):** añadir `speedlogic.com.co` a
   `IMAGE_REMOTE_HOSTS` en `.env` (local, no versionado) y en `.env.example`
   (plantilla versionada). Recordatorio: `next.config.ts` se lee al arrancar,
   hay que **reiniciar `npm run dev`** tras cambiarlo.
2. **Defensa en profundidad (código):** `MediaFrame` envuelve `next/image` en
   un `ImageErrorBoundary` interno que muestra `fallbackSrc` (imagen local,
   siempre permitida) si el render lanza. El boundary se resetea con
   `key={effectiveSrc}` cuando cambia la fuente. Así, una futura URL de un
   host no declarado (p. ej. cargada desde el panel admin) degrada esa tarjeta
   al placeholder en vez de romper la página.
3. **Sin duplicar config en el cliente:** se evaluó exponer la allowlist vía
   `NEXT_PUBLIC_*` para prevalidar el hostname en `MediaFrame`; se descartó
   porque obliga a mantener dos variables en sync (AGENTS.md §3.5 pide
   minimizarlo) y el boundary cubre todos los casos (host no configurado, `src`
   malformada) sin conocer la allowlist.

## Consequences

- Añadir un host sigue siendo solo `IMAGE_REMOTE_HOSTS` + reinicio (ADR 0006).
- Tests: `media-frame-boundary.test.tsx` simula un host no configurado y
  verifica que se muestra el placeholder sin propagar el error; `media-frame.test.tsx`
  incluye regresión con la URL real reportada.
