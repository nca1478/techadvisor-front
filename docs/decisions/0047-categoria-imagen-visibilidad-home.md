# 0047 — Imagen única y visibilidad en home por categoría

- Estado: aceptado.
- Fecha: 2026-10-15.

## Contexto

El home "compra por categoría" usaba solo el mapa estático
`category-images.ts`. El admin de categorías no tenía imagen ni control
de visibilidad (backend ADR 0052 agrega `imageUrl/imageAlt/showInHome`).

## Decisión

- El formulario de categoría (crear/editar) gana: URL de portada + alt
  con vista previa (misma regla https que productos, vacía = sin foto)
  y checkbox "Mostrar en el inicio".
- La tabla admin muestra miniatura y estado Visible/Oculta.
- `CategoryGrid` prefiere `category.imageUrl` del backend y cae al mapa
  por slug y luego al placeholder (`MediaFrame`).
- `HomeContainer` filtra `showInHome === false` (filas pre-contrato sin
  flag se tratan como visibles, igual que el `DEFAULT TRUE` del backend).
- El mapa estático se conserva como fallback e incluye monitores
  (`photo-1527443224154-c4a3942d3acf`).
- Tipos `AdminCategory`/`CatalogCategory` regenerados desde OpenAPI
  (`npm run api:types`).

## Consecuencias

- Sin cambios visuales con datos actuales: el seeder usa las mismas
  fotos que el mapa.
- Ocultar una categoría solo afecta al home, no al listado ni al admin.
