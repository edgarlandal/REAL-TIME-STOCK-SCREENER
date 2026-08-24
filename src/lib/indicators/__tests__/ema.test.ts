import { describe, expect, it } from "vitest";
import type { CandleData } from "@/types/chart";
import { calculateEMA } from "../ema";

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

describe("calculateEMA", () => {
  it("uses the first SMA as the seed and applies the EMA recurrence", () => {
    const result = calculateEMA(createCandles([10, 20, 30, 40, 50]), 3);

    expect(result).toEqual([
      { time: 3, value: 20 },
      { time: 4, value: 30 },
      { time: 5, value: 40 },
    ]);
  });

  it("returns an empty series until enough candles are available", () => {
    expect(calculateEMA(createCandles([10, 20]), 3)).toEqual([]);
  });

  it("rejects periods that are not positive integers", () => {
    expect(() => calculateEMA(createCandles([10]), 0)).toThrow(RangeError);
  });
});