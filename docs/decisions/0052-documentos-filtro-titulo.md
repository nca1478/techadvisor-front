# 0052 — Filtro por título y limpiar filtros en la lista de documentos

- **Fecha:** 2026-10-16
- **Estado:** aceptado
- **Contexto:** la lista pedía buscar por título (palabra o extracto) y un botón "Limpiar filtros".
- **Decisión:**
  - La búsqueda es de servidor (`GET /admin/documents?q=`, backend ADR 0056): subcadena case-insensitive sobre el título, combinable con los filtros de tipo/estado y paginación. Filtrar solo en cliente habría roto la paginación (página de 10).
  - UX igual que productos (`admin-products-view.tsx`): input con borrador local que aplica con Enter (navegación URL-driven + remontaje por `key`), y botón secundario "Limpiar filtros" (`messages.catalog.clearFilters`, ya usado en la tabla vacía) que resetea `q`/tipo/estado a página 1.
  - `AdminDocumentsQuery` suma `q: string`; `filtered` de la tabla lo incluye para mostrar el estado vacío filtrado.
- **Consecuencias:** `documentos/page.tsx` parsea `q` (máx. 100, igual que el backend) y lo incluye en el fetch y en el `key` de remontaje.
