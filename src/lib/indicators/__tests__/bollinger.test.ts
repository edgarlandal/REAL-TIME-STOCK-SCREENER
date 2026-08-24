import { describe, expect, it } from "vitest";
import type { CandleData } from "@/types/chart";
import { calculateBollingerBands } from "../bollinger";

function createCandles(closes: number[]): CandleData[] {
  return closes.map((close, index) => ({
    time: index + 1,
    open: close,
    high: close,
    low: close,
    close,
    volume: 1_000,
  }));
}

describe("calculateBollingerBands", () => {
  it("calculates precise population-standard-deviation bands for rolling windows", () => {
    const results = calculateBollingerBands(createCandles([1, 2, 3, 4]), 3);
    const populationStandardDeviation = Math.sqrt(2 / 3);
    const [firstResult, secondResult] = results;

    expect(firstResult?.time).toBe(3);
    expect(firstResult?.middle).toBe(2);
    expect(firstResult?.upper).toBeCloseTo(2 + 2 * populationStandardDeviation, 12);
    expect(firstResult?.lower).toBeCloseTo(2 - 2 * populationStandardDeviation, 12);
    expect((firstResult!.upper - firstResult!.middle) / 2).toBeCloseTo(
      populationStandardDeviation,
      12,
    );

    expect(secondResult?.time).toBe(4);
    expect(secondResult?.middle).toBe(3);
    expect(secondResult?.upper).toBeCloseTo(3 + 2 * populationStandardDeviation, 12);
    expect(secondResult?.lower).toBeCloseTo(3 - 2 * populationStandardDeviation, 12);
  });

  it("returns no bands until a complete window is available", () => {
    expect(calculateBollingerBands(createCandles([1, 2]), 3)).toEqual([]);
  });

  it("rejects invalid periods and standard-deviation multipliers", () => {
    const candles = createCandles([1, 2, 3]);

    expect(() => calculateBollingerBands(candles, 0)).toThrow(RangeError);
    expect(() => calculateBollingerBands(candles, 3, -1)).toThrow(RangeError);
  });
});