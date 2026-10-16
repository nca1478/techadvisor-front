# 0049 — Pasos de imágenes e inventario solo en editar producto

- Estado: aceptado.
- Fecha: 2026-10-16.

## Contexto

La página de edición mostraba el wizard y, debajo en tarjetas
separadas, el editor de imágenes y el panel de inventario. Se pidió
integrarlos como pasos 5 (imágenes) y 6 (inventario) solo en
edición; crear queda con 4 pasos.

## Decisión

- `ProductForm` acepta `extraSteps?: { title, content }[]` (solo
  edición los pasa). El stepper, el avance y el submit usan
  `lastStep = 3 + extraSteps.length`, así que crear sigue en 4.
- Los pasos extra no tienen validación (`errorsForStep` devuelve
  `{}` para pasos > 3); cada panel conserva su propio guardado
  (PUT de imágenes, ajuste con confirmación).
- El botón de guardar el formulario base aparece en el paso 4
  (traducción, como antes) y en el último paso; en los pasos
  intermedios extra solo hay Back/Next.
- La página de edición inyecta `ImagesEditorContainer` e
  `InventoryPanelContainer` (client components autocontenidos, con
  datos ya resueltos en el servidor) como contenido de los pasos y
  elimina sus tarjetas separadas. El bloque de estado queda fuera
  del wizard, como estaba.

## Consecuencias

- Crear producto no cambia: mismo wizard de 4 pasos, mismo submit.
- Títulos de los pasos 5/6 reutilizan `admin.images.title` y
  `admin.inventory.title` (es/en ya existían).
