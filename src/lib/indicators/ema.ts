import type { CandleData, EMAResult } from "@/types/chart";

export function calculateEMA(data: CandleData[], period: number): EMAResult[] {
  if (!Number.isInteger(period) || period <= 0) {
    throw new RangeError("period must be a positive integer");
  }

  if (data.length < period) {
    return [];
  }

  const multiplier = 2 / (period + 1);
  const seedEndIndex = period - 1;
  const firstRecursiveIndex = seedEndIndex + 1;
  let ema = 0;

  for (let index = 0; index <= seedEndIndex; index += 1) {
    ema += data[index].close;
  }

  ema /= period;

  const results: EMAResult[] = [{ time: data[seedEndIndex].time, value: ema }];

  for (let index = firstRecursiveIndex; index < data.length; index += 1) {
    ema = data[index].close * multiplier + ema * (1 - multiplier);
    results.push({ time: data[index].time, value: ema });
  }

  return results;
}