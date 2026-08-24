import { describe, expect, it } from "vitest";
import type { CandleData } from "@/types/chart";
import { calculateSMA } from "./sma";

const candles: CandleData[] = [
  { time: 1, open: 10, high: 10, low: 10, close: 10, volume: 100 },
  { time: 2, open: 20, high: 20, low: 20, close: 20, volume: 100 },
  { time: 3, open: 30, high: 30, low: 30, close: 30, volume: 100 },
  { time: 4, open: 40, high: 40, low: 40, close: 40, volume: 100 },
];

describe("calculateSMA", () => {
  it("returns null until enough candles are available and then calculates a rolling average", () => {
    expect(calculateSMA(candles, 3)).toEqual([
      { time: 1, value: null },
      { time: 2, value: null },
      { time: 3, value: 20 },
      { time: 4, value: 30 },
    ]);
  });

  it("rejects periods that are not positive integers", () => {
    expect(() => calculateSMA(candles, 0)).toThrow(RangeError);
  });
});