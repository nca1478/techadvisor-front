# 0059 — Guardar en editar producto: visible desde revisión y salto al paso con error

Fecha: 2026-10-17

## Contexto

En editar producto el botón "Guardar cambios" solo existía en el último
paso (inventario) y, si la validación fallaba, el contenedor retornaba en
silencio: el clic parecía no hacer nada porque los errores estaban en
pasos anteriores invisibles.

## Decisión

- `ProductForm`: el save se muestra desde el paso de revisión (índice 3)
  cuando hay pasos extra (imágenes e inventario se guardan por sus propios
  endpoints) y `onSubmit` puede resolver al índice del paso con error para
  navegar hasta él.
- Nuevo `firstErrorStep(errors, mode)` en `product-submit`: primer paso con
  error (0 básico, 1 catálogo/precio, 2 specs).
- Contenedores create/edit: ante errores muestran `productForm.fixErrors`
  en el pie (siempre visible) y devuelven ese paso; el éxito/error de red
  devuelve `null` como antes.

## Consecuencias

- Guardar ya no exige visitar imágenes/inventario; un fallo de validación
  lleva al paso con los errores marcados en lugar de parecer muerto.
