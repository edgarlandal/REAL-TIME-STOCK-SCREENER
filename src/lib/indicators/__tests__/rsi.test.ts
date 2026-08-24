import { describe, expect, it } from "vitest";
import type { CandleData } from "@/types/chart";
import { calculateRSI } from "../rsi";

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

describe("calculateRSI", () => {
  it("seeds and smooths average gains and losses using Wilder's method", () => {
    const result = calculateRSI(createCandles([100, 102, 101, 103]), 2);

    expect(result[0]).toEqual({ time: 3, value: 100 - 100 / (1 + 2) });
    expect(result[1]?.value).toBeCloseTo(85.71428571428571, 12);
  });

  it("returns 100 when the average loss is zero", () => {
    const result = calculateRSI(createCandles([10, 11, 12, 13]), 2);

    expect(result.map(({ value }) => value)).toEqual([100, 100]);
  });

  it("returns an empty series until enough close-to-close changes are available", () => {
    expect(calculateRSI(createCandles([10, 11]), 2)).toEqual([]);
  });
});