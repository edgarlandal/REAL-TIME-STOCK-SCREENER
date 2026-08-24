# Errata

Este documento registra las tres correcciones aplicadas a los errores identificados en el PDF de requisitos.

## Errata 1: Metricas financieras no finitas

**Causa raiz:** `Stock` declaraba metricas como `number`, pero no existia una frontera de datos que validara respuestas de API, cache o streams antes de tratarlas como acciones de dominio. Datos como `"NaN"`, `null` o `NaN` podian propagarse hasta filtros, graficos y renderizadores.

**Impacto:** comparaciones como P/E, `changePercent` y `volume` podian devolver resultados inconsistentes. Un `NaN` no lanza error por si solo y hace que comparaciones numericas fallen silenciosamente.

**Solucion aplicada:**

- `src/types/stock.ts` expone `StockNumericField` y `STOCK_NUMERIC_FIELDS`, que enumeran todos los campos numericos obligatorios.
- `src/lib/data/stockAdapter.ts` incorpora `adaptStock`, `adaptStocks` y `parseFiniteNumber`.
- El adaptador convierte cadenas numericas validas y rechaza valores vacios, `null`, `NaN`, infinito y texto no numerico antes de construir un `Stock`.

**Verificacion:** `src/lib/data/stockAdapter.test.ts` comprueba la conversion de P/E, `changePercent` y `volume`, ademas del rechazo de entradas no finitas.

## Errata 2: Indice fuera de rango en retardos de reconexion

**Causa raiz:** una agenda de retardos configurada como array necesita proteger el acceso por indice. Un contador de reintentos mayor que `delays.length - 1` puede producir `undefined`, que a su vez puede dar lugar a un timeout invalido o comportamiento de reconexion no determinista.

**Impacto:** despues de repetidas caidas de red, la reconexion podia dejar de respetar la politica configurada o fallar en runtime.

**Solucion aplicada:**

- `UseWebSocketOptions` acepta `reconnectDelays?: readonly number[]`.
- `getScheduledReconnectDelay` usa `Math.min(Math.max(retryCount, 0), reconnectDelays.length - 1)` para truncar la busqueda al ultimo retardo disponible.
- Los arrays vacios, los valores negativos y los valores no finitos se rechazan explicitamente.
- Si no se proporciona una agenda, el hook conserva el backoff exponencial acotado existente.

**Verificacion:** `src/hooks/useWebSocket.test.tsx` comprueba que `[100, 250, 500]` devuelve `500` para el reintento `999`.

## Errata 3: Semilla EMA y comienzo de la recurrencia

**Causa raiz:** los limites de la semilla y de la recurrencia estaban expresados por separado con `period - 1` y `period`. Aunque el comportamiento era correcto, esa duplicacion hacia facil introducir un desplazamiento de un indice al modificar el algoritmo.

**Impacto:** una semilla calculada con menos de $N$ cierres, o una recurrencia iniciada en la vela equivocada, distorsiona toda la serie EMA posterior.

**Solucion aplicada:**

- `src/lib/indicators/ema.ts` define `seedEndIndex = period - 1` y `firstRecursiveIndex = seedEndIndex + 1`.
- La semilla suma exactamente los indices $0$ a $N-1$.
- El primer resultado se asocia a la vela $N$ y la recurrencia comienza en el indice $N$.

**Verificacion:** `src/lib/indicators/__tests__/ema.test.ts` usa los cierres `[3, 6, 12]` con periodo `3` y valida una unica semilla EMA igual a $7$.