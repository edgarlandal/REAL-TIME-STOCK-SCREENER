import { describe, expect, it } from "vitest";
import type { CandleData } from "@/types/chart";
import { calculateSMA } from "../sma";

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

describe("calculateSMA", () => {
  it("calculates a rolling average for a known dataset", () => {
    const result = calculateSMA(createCandles([2, 4, 6, 8, 10]), 3);

    expect(result).toEqual([
      { time: 1, value: null },
      { time: 2, value: null },
      { time: 3, value: 4 },
      { time: 4, value: 6 },
      { time: 5, value: 8 },
    ]);
  });

  it("returns an empty result for an empty dataset", () => {
    expect(calculateSMA([], 5)).toEqual([]);
  });

  it("returns null for every candle when the dataset is shorter than the period", () => {
    expect(calculateSMA(createCandles([12, 18]), 3)).toEqual([
      { time: 1, value: null },
      { time: 2, value: null },
    ]);
  });

  it("calculates decimal averages with floating-point precision", () => {
    const result = calculateSMA(createCandles([1.1, 1.2, 1.3, 1.4]), 3);

    expect(result[2].value).toBeCloseTo(1.2, 10);
    expect(result[3].value).toBeCloseTo(1.3, 10);
  });
});