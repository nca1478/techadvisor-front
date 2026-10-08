# 0018 — Cierre de la serie P1-Diseño (coherencia final)

Date: 2026-10-08
Status: accepted

## Context

La serie P1-Diseño (0013–0017) modernizó la UI sin romper funcionalidad.
Este ADR registra el estado final verificado y lo pendiente explícito.

## Estado verificado el 2026-10-08

- Sin hex fuera de `globals.css` (regla R12 del ADR 0005): verificado con
  búsqueda en `src`. Sin slugs visibles en la tienda (solo en el form de
  admin y en URLs, donde corresponde).
- `CatalogLoading` eliminado: quedó sin usos tras migrar los fallbacks a
  skeletons con identidad (`HomeSkeleton`, `ListingSkeleton`,
  `DetailSkeleton`). Un solo patrón de carga.
- Paleta dark preparada (`[data-theme="dark"]`) verificada AA con cálculo
  directo: fg/bg 16.44, muted/bg 8.57, sobre primario 6.75, sobre acento
  6.83 (mínimo exigido 4.5). Lo pendiente es solo el mecanismo
  (toggle + persistencia), no los tokens.

## Pendiente explícito (futuro, fuera de esta serie)

1. Modo oscuro: interruptor + persistencia + `data-theme` switching.
2. Conteos/imágenes por categoría (requiere cambio de contrato backend).
3. `loading.tsx` por ruta como mejora sobre los `Suspense` actuales.

## Dependencias (verificación obligatoria)

- Context7 disponible en la sesión; esta tarea no añade librerías
  (eliminación de código muerto + documentación). Sin `npm install`, sin
  versiones que registrar.
