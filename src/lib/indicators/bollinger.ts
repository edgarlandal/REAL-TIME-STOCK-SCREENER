import type { BollingerBandsResult, CandleData } from "@/types/chart";

export function calculateBollingerBands(
  data: CandleData[],
  period = 20,
  stdDevMultiplier = 2,
): BollingerBandsResult[] {
  if (!Number.isInteger(period) || period <= 0) {
    throw new RangeError("period must be a positive integer");
  }

  if (!Number.isFinite(stdDevMultiplier) || stdDevMultiplier < 0) {
    throw new RangeError("stdDevMultiplier must be a non-negative finite number");
  }

  const results: BollingerBandsResult[] = [];
  let sum = 0;
  let sumOfSquares = 0;

  for (let index = 0; index < data.length; index += 1) {
    const close = data[index].close;
    sum += close;
    sumOfSquares += close * close;

    if (index >= period) {
      const expiredClose = data[index - period].close;
      sum -= expiredClose;
      sumOfSquares -= expiredClose * expiredClose;
    }

    if (index < period - 1) {
      continue;
    }

    const middle = sum / period;
    const variance = Math.max(0, sumOfSquares / period - middle * middle);
    const standardDeviation = Math.sqrt(variance);

    results.push({
      time: data[index].time,
      upper: middle + standardDeviation * stdDevMultiplier,
      middle,
      lower: middle - standardDeviation * stdDevMultiplier,
    });
  }

  return results;
}