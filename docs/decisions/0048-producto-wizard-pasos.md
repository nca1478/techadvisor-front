# 0048 — Formulario de producto como wizard en 4 pasos

- Estado: aceptado.
- Fecha: 2026-10-16.

## Contexto

El formulario de crear/editar producto era una sola página larga
(SKU/slug/nombre/descripción + marca/categoría/precio/stock +
specs + traducción). Se pidió dividirlo en 4 pasos según las
capturas: 1 identidad, 2 catálogo y precio, 3 especificaciones,
4 traducción opcional y guardado.

## Decisión

- `ProductForm` pasa a wizard presentacional de 4 pasos con stepper
  accesible (`nav` + `aria-current="step"`), Back/Next y submit solo
  en el paso 4. El paso (`step`) es estado UI interno.
- La validación sigue en una sola fuente (`validateProductForm` en
  `product-submit.ts`); se agrega `errorsForStep()` que filtra errores
  por paso (`specs.*` → paso 3; traducción opcional nunca bloquea).
  El contenedor valida el paso antes de avanzar (`onValidateStep`) y
  revalida todo al guardar (`onSubmit`).
- Sin dependencias nuevas; solo tokens/primitivas de `components/ui`.
- Textos del stepper en `messages/en.json` y `es.json` (sin hardcodear).

## Consecuencias

- Crear y editar comparten el mismo wizard; el modo `edit` omite
  `status`/`initialStock` en el paso 2 como antes.
- Navegación: pasos visitados libremente hacia atrás; avanzar exige
  paso válido. El guardado final revalida el formulario completo.
