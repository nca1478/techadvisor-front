# 0050 — Formulario de categoría como wizard en 3 pasos

- Estado: aceptado.
- Fecha: 2026-10-16.

## Contexto

El formulario de crear/editar categoría era una sola página larga
(nombre/slug/padre + portada + traducción). Se pidió el mismo
formato wizard del módulo de productos, en 3 pasos: 1 identidad,
2 imagen de portada, 3 traducción opcional con el botón de guardado.

## Decisión

- `CategoryForm` pasa a wizard presentacional de 3 pasos con el
  mismo patrón del wizard de productos: stepper accesible en una
  línea con flechas primarias bajo `lg`, Back/Next y submit solo en
  el último paso.
- La validación sigue en una sola fuente (`validateCategoryForm`);
  se agrega `categoryErrorsForStep()` (paso 1: nombre/slug/padre,
  paso 2: imagen; traducción opcional nunca bloquea).
- Crear restringe la navegación (secuencial con validación por
  paso); editar usa navegación libre (`freeNavigation`), igual que
  productos.
- Textos del stepper en `messages/en.json` y `es.json` (`step1Title`
  a `stepsScrollNext`, más `back`/`next` en `categoryForm`).
- El e2e `admin-categories.spec.ts` navega el wizard (Next ×2
  antes de crear/guardar).

## Consecuencias

- Sin cambios en el contrato con el backend ni en las reglas de
  validación; solo presentación y navegación.
