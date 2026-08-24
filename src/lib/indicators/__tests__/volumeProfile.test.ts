import { describe, expect, it } from "vitest";
import type { CandleData } from "@/types/chart";
import { calculateVolumeProfile } from "../volumeProfile";

function createCandle(low: number, high: number, volume: number): CandleData {
  return { time: 1, open: low, high, low, close: high, volume };
}

describe("calculateVolumeProfile", () => {
  it("distributes each candle volume across overlapping uniform price bins and marks the POC", () => {
    const profile = calculateVolumeProfile(
      [createCandle(0, 2, 100), createCandle(0, 1, 100)],
      2,
    );

    expect(profile).toEqual([
      { priceMin: 0, priceMax: 1, volume: 150, isPOC: true },
      { priceMin: 1, priceMax: 2, volume: 50, isPOC: false },
    ]);
    expect(profile.reduce((total, bin) => total + bin.volume, 0)).toBe(200);
  });

  it("accumulates volume by price range and selects the highest-volume range as the POC", () => {
    const profile = calculateVolumeProfile(
      [createCandle(0, 1, 100), createCandle(1, 2, 250), createCandle(2, 3, 150)],
      3,
    );

    expect(profile.map(({ volume }) => volume)).toEqual([100, 250, 150]);
    expect(profile.map(({ isPOC }) => isPOC)).toEqual([false, true, false]);
    expect(profile.filter(({ isPOC }) => isPOC)).toHaveLength(1);
  });

  it("assigns a zero-range candle to its containing bin", () => {
    const profile = calculateVolumeProfile([createCandle(10, 10, 250)]);

    expect(profile).toEqual([{ priceMin: 10, priceMax: 10, volume: 250, isPOC: true }]);
  });

  it("returns an empty profile for no candles and rejects invalid bin counts", () => {
    expect(calculateVolumeProfile([])).toEqual([]);
    expect(() => calculateVolumeProfile([createCandle(0, 1, 100)], 0)).toThrow(RangeError);
  });
});