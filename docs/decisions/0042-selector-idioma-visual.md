# 0042 — Selector visual de idioma (bandera + iniciales)

Fecha: 2026-10-14
Estado: aceptado

## Contexto

El header mostraba el idioma como un `<select>` nativo con el código de texto
("ES"), inconsistente con los iconos vecinos (carrito, sesión) y poco visual.

## Decisión

- `LocaleCurrencyControls` renderiza el idioma como botón con la bandera del
  locale actual + sus iniciales (`ES`/`EN`); al pulsarlo abre un menú con las
  banderas e iniciales de cada locale soportado.
- Banderas en `src/components/ui/locale-flags.tsx` como SVG inline, sin
  dependencias (las banderas emoji se ven como letras planas en Windows).
- `en` usa la bandera de Reino Unido (GB): es el marcador convencional del
  idioma inglés y su SVG simplificado es nítido a tamaño pequeño.
- Los colores de las banderas son colores propios de contenido (como las
  imágenes de producto), no cromo de UI: todo lo demás sigue usando los
  tokens del sistema de diseño. El botón copia el estilo de los iconos
  vecinos (mismo padding, `text-header-foreground`, tooltip + nombre para
  lector de pantalla, foco visible con `ring-ring`).
- Accesibilidad: `aria-haspopup="menu"`, `aria-expanded`, opciones como
  `menuitemradio` con `aria-checked`; cierra con Escape, clic fuera o
  selección. El cambio de locale reutiliza `useLocaleSwitcher` (misma ruta
  con otro prefijo), sin cambios de contrato.

## Consecuencias

- Cambio presentacional + tests en `locale-currency-controls.*` y nuevo
  `src/components/ui/locale-flags.tsx`.
- Si se añade un locale nuevo, hay que agregar su bandera en
  `LOCALE_FLAGS` (los locales siguen siendo `en`/`es`; ver ADR 0006).
