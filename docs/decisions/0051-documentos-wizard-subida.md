# 0051 — Wizard de subida de documentos en página propia

- **Fecha:** 2026-10-16
- **Estado:** aceptado
- **Contexto:** la pantalla `/admin/documentos` mezclaba dos formularios de ingesta (tabs subir-archivo / registrar-URL) con la lista. Se pide un wizard como el de productos, con un solo botón "Subir" que abre otra página, y que la lista quede sola.
- **Decisión:**
  - `/admin/documentos` solo lista + filtros + un botón `uploadAction` ("Subir") con `href` a `/admin/documentos/nuevo`.
  - Nueva página `/admin/documentos/nuevo` con wizard de 2 pasos: paso 1 = pantalla "subir archivo", paso 2 = pantalla "registrar URL". Título/tipo/idioma son estado compartido; el botón "Registrar e ingerir" (`urlSubmit`) solo existe en el paso 2.
  - Regla XOR (ambigüedad resuelta por la vía más simple): o archivo o URL. El paso 1 no exige archivo; el envío final usa el archivo si hay uno (la URL se ignora) y si no exige título + URL http(s) válida. Sin cambios de contrato: mismos payloads (`POST /documents/upload` multipart y `POST /documents` JSON).
  - Tras crear, redirige a la lista para seguir la ingesta (igual que crear producto redirige a su edición).
  - El atajo "Crear documento" del panel asesor ahora enlaza a `documentos/nuevo?title=`.
- **Alternativas descartadas:** mantener tabs en la lista (rechazado por el pedido); dos botones "Subir archivo / Registrar URL" (se pidió un solo botón); validación que prohíba adjuntar archivo y URL a la vez (más fricción; gana el archivo en silencio y se documenta aquí).
- **Consecuencias:** `ingestTabsLabel` queda sin uso (se conserva para no romper el diccionario); tests nuevos en `document-wizard.test.ts` y `document-upload-wizard.test.tsx`.
