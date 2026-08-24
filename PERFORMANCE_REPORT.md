# Performance Report

## Scope

Este informe separa objetivos de aceptacion de resultados verificados. No se declara una puntuacion Lighthouse ni un tamano gzip como medido hasta ejecutar la auditoria en un navegador y un analisis de bundle reproducibles.

| Metric | Target | Current evidence | Status |
| --- | --- | --- | --- |
| Lighthouse Performance | >= 90 | Pendiente de auditoria de navegador | Pending |
| Lighthouse Accessibility | >= 95 | Pendiente de auditoria de navegador | Pending |
| Cumulative Layout Shift (CLS) | 0 | Viewports, filas y placeholders de charts tienen alturas reservadas; falta medicion Lighthouse | Design target |
| Initial bundle | < 250 KB gzip | Pendiente de analisis gzip | Pending |
| Filter evaluation | < 100 ms para 5,000 acciones y 12 filtros | Prueba de integracion ejecuta cinco pasadas bajo 100 ms | Verified |

## Verified Checks

| Check | Evidence |
| --- | --- |
| Filter engine | `src/lib/filterEngine/__tests__/filterEngine.test.ts` crea 5,000 acciones y aplica 12 condiciones AST en cinco ejecuciones. |
| Virtual grid | `src/components/grid/__tests__/DataGrid.test.tsx` comprueba que una entrada de 5,000 filas solo monta aproximadamente 25 filas virtuales. |
| rAF batching | `src/store/stockStore.test.ts` confirma que multiples ticks de un simbolo se fusionan y se aplican en un solo frame. |
| Reconnect backoff | `src/hooks/useWebSocket.test.tsx` y `src/hooks/__tests__/useWebSocket.test.ts` cubren backoff, truncamiento de agenda y flujo rAF. |
| Production compile | `npm run build` valida TypeScript y el build de Next.js. |

## Design Measures

- **Virtualization:** filas de 36 px, viewport con altura fija y overscan de 15 reducen nodos DOM y evitan desplazamientos de layout.
- **Dynamic charts:** `next/dynamic` con `ssr: false` mantiene Lightweight Charts fuera del render de servidor y del bundle inicial de rutas que no lo usan.
- **Realtime coalescing:** el `Map` intermedio conserva solo el ultimo cambio por simbolo antes de publicar estado.
- **Stable rendering:** la primera columna pinneada usa dimensiones de grid estables; charts y panel RSI reservan altura durante su carga.
- **Local export and cache:** IndexedDB, CSV, JSON y capturas PNG se ejecutan en cliente sin llamadas de red adicionales.

## Reproducible Audit Commands

```powershell
npm test
npm run build
$env:ANALYZE = "true"; npx next build --webpack
```

Ejecutar Lighthouse contra una instancia de produccion (`npm run build` seguido de `npm start`) en desktop y mobile. Registrar la fecha, navegador, viewport y red usados antes de convertir las filas pendientes en metricas verificadas.