# 0053 — Rango del dashboard como desplegable en la fila del nav

- **Fecha:** 2026-10-16
- **Estado:** aceptado
- **Contexto:** los botones Hoy / 7 días / 30 días ocupaban una fila propia sobre los KPI.
- **Decisión:**
  - Nuevo `DashboardRangeSelect` (cliente): `Select` nativo con etiqueta oculta, lee el rango actual de la URL (`useSearchParams` + `parseDashboardRange`) y navega a `/admin?range=…` al cambiar, así el presentador de servidor sigue refetch URL-driven.
  - Vive en la fila de `AdminNav`, a la derecha y con mitad de ancho (`w-26`); solo se renderiza cuando la sección activa es Panel. Sin cambios de contrato ni de fetch.
- **Alternativas descartadas:** mantener botones (rechazado por el pedido); pasar el rango por props desde el layout (los layouts no reciben `searchParams`).
- **Consecuencias:** test nuevo `admin-nav.test.tsx` (visible solo en Panel + navegación); el test del selector salió de `dashboard-view.test.tsx`.
