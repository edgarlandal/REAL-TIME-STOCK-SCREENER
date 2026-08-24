import type { FilterGroup } from "@/types/filter";
import type { Stock } from "@/types/stock";
import { filterStocks } from "./astEngine";

export const SPEED_DEMON_MAX_DURATION_MS = 100;

export interface FilterBenchmarkResult {
  stocks: Stock[];
  durationMs: number;
  matchedCount: number;
  isSpeedDemon: boolean;
}

type Now = () => number;

export function benchmarkFilter(
  stocks: Stock[],
  criteria: FilterGroup,
  now: Now = performance.now.bind(performance),
): FilterBenchmarkResult {
  const start = now();
  const matches = filterStocks(stocks, criteria);
  const durationMs = now() - start;

  return {
    stocks: matches,
    durationMs,
    matchedCount: matches.length,
    isSpeedDemon: meetsSpeedDemonThreshold(durationMs),
  };
}

export function meetsSpeedDemonThreshold(durationMs: number): boolean {
  return durationMs < SPEED_DEMON_MAX_DURATION_MS;
}

export function assertSpeedDemon(result: FilterBenchmarkResult): void {
  if (!result.isSpeedDemon) {
    throw new Error(
      `Speed Demon requires filtering in under ${SPEED_DEMON_MAX_DURATION_MS}ms; received ${result.durationMs.toFixed(3)}ms.`,
    );
  }
}