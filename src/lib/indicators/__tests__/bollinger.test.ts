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
  it("calculates population standard deviation bands for a known window", () => {
    const [result] = calculateBollingerBands(createCandles([1, 2, 3]), 3);
    const populationStandardDeviation = Math.sqrt(2 / 3);

    expect(result?.time).toBe(3);
    expect(result?.middle).toBe(2);
    expect(result?.upper).toBeCloseTo(2 + 2 * populationStandardDeviation, 12);
    expect(result?.lower).toBeCloseTo(2 - 2 * populationStandardDeviation, 12);
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