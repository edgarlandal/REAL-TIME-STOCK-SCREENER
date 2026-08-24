import type { CandleData, RSIResult } from "@/types/chart";

export function calculateRSI(data: CandleData[], period = 14): RSIResult[] {
  if (!Number.isInteger(period) || period <= 0) {
    throw new RangeError("period must be a positive integer");
  }

  if (data.length <= period) {
    return [];
  }

  let averageGain = 0;
  let averageLoss = 0;

  for (let index = 1; index <= period; index += 1) {
    const change = data[index].close - data[index - 1].close;
    averageGain += Math.max(change, 0);
    averageLoss += Math.max(-change, 0);
  }

  averageGain /= period;
  averageLoss /= period;

  const results: RSIResult[] = [
    { time: data[period].time, value: toRSI(averageGain, averageLoss) },
  ];

  for (let index = period + 1; index < data.length; index += 1) {
    const change = data[index].close - data[index - 1].close;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);

    averageGain = (averageGain * (period - 1) + gain) / period;
    averageLoss = (averageLoss * (period - 1) + loss) / period;

    results.push({ time: data[index].time, value: toRSI(averageGain, averageLoss) });
  }

  return results;
}

function toRSI(averageGain: number, averageLoss: number): number {
  if (averageLoss === 0) {
    return 100;
  }

  const relativeStrength = averageGain / averageLoss;
  return 100 - 100 / (1 + relativeStrength);
}