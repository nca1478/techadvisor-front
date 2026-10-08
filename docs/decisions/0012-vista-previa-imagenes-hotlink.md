# 0012 — Vista previa de imágenes del admin: hotlinking y reintento

Date: 2026-10-08
Status: accepted

## Context

Al pegar `https://speedlogic.com.co/.../33385.1.png` en el editor de imágenes
del admin, la vista previa mostraba "This URL does not load an image." aunque
la URL existe. Diagnóstico (verificado con `curl.exe`):

- Sin `Referer`: `HTTP 200 image/png` (la imagen existe).
- Con `Referer: http://localhost:3000/...`: `HTTP 403` (protección anti-hotlink
  del host: bloquea peticiones cuyo `Referer` es un origen ajeno).

El `<img>` de vista previa enviaba el origen del admin como `Referer` y el
host lo rechazaba. Además, el estado `broken` de `ImagePreview` quedaba
atascado: al escribir la URL carácter a carácter, los valores intermedios
disparaban `onError` y el mensaje persistía aunque la URL final fuera válida.

## Decisiones

1. `referrerPolicy="no-referrer"` en el `<img>` de vista previa: el navegador
   no envía `Referer`, el host sirve la imagen y la vista previa carga. Solo
   afecta a la vista previa del admin; el resto (incluido `next/image` del
   catálogo, que descarga desde el servidor) no cambia.
2. Resetear `broken` cuando cambia `url` (ajuste de estado durante el render,
   patrón recomendado por React): cada URL nueva merece un intento de carga fresco.

## Consequences

- Si un host resolviera bloquear también las peticiones sin `Referer`, la
  vista previa seguiría mostrando el mensaje de URL rota, pero guardar seguiría
  funcionando y el catálogo (vía `next/image` servidor) podría cargarla igual.
- Tests en `images-editor.test.tsx`: `referrerpolicy` presente, reintento tras
  error al cambiar la URL, y hint con URL vacía.
