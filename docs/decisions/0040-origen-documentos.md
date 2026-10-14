# 0040 — Origen visible en la tabla de documentos

Fecha: 2026-10-14
Estado: aceptado

## Contexto

El backend siembra el corpus RAG vía seeder (`seed:documents`: fichas
técnicas `auto:product`, `seed:faq:…`, `seed:warranty:…`, `seed:policy:…`)
junto a las subidas manuales (`manual`). La tabla de `/admin/documentos`
mostraba locale, archivo y URL pero no el origen, así que no se distinguía
de un vistazo qué filas venían del seed.

## Decisión

Mostrar el `source` del documento (ya presente en `AdminDocumentDto`, sin
cambios de contrato) en la línea secundaria del título, junto a locale,
archivo y URL. Sin filtros nuevos: el filtro por tipo ya cubre ficha
técnica, FAQ, garantía y política.

## Consecuencias

- Cambio solo presentacional en `documents-table.tsx` + test.
- Ningún estilo nuevo fuera de los tokens existentes.
