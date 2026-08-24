import type { CandleData, SMAResult } from "@/types/chart";

export function calculateSMA(data: CandleData[], period: number): SMAResult[] {
  if (!Number.isInteger(period) || period <= 0) {
    throw new RangeError("period must be a positive integer");
  }

  let windowSum = 0;

  return data.map((candle, index) => {
    windowSum += candle.close;

    if (index >= period) {
      windowSum -= data[index - period].close;
    }

    return {
      time: candle.time,
      value: index < period - 1 ? null : windowSum / period,
    };
  });
}