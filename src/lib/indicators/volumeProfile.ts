import type { CandleData, VolumeProfileBin } from "@/types/chart";

export function calculateVolumeProfile(
  data: CandleData[],
  binsCount = 24,
): VolumeProfileBin[] {
  if (!Number.isInteger(binsCount) || binsCount <= 0) {
    throw new RangeError("binsCount must be a positive integer");
  }

  if (data.length === 0) {
    return [];
  }

  const priceMin = Math.min(...data.map(({ low }) => low));
  const priceMax = Math.max(...data.map(({ high }) => high));

  if (priceMin === priceMax) {
    return [
      {
        priceMin,
        priceMax,
        volume: data.reduce((total, candle) => total + candle.volume, 0),
        isPOC: true,
      },
    ];
  }

  const binSize = (priceMax - priceMin) / binsCount;
  const bins = Array.from({ length: binsCount }, (_, index) => ({
    priceMin: priceMin + index * binSize,
    priceMax: index === binsCount - 1 ? priceMax : priceMin + (index + 1) * binSize,
    volume: 0,
  }));

  for (const candle of data) {
    const candleLow = Math.min(candle.low, candle.high);
    const candleHigh = Math.max(candle.low, candle.high);

    if (candleLow === candleHigh) {
      const binIndex = Math.min(
        binsCount - 1,
        Math.max(0, Math.floor((candleLow - priceMin) / binSize)),
      );
      bins[binIndex].volume += candle.volume;
      continue;
    }

    const firstBin = Math.max(0, Math.floor((candleLow - priceMin) / binSize));
    const lastBin = Math.min(binsCount - 1, Math.ceil((candleHigh - priceMin) / binSize) - 1);
    const candleRange = candleHigh - candleLow;

    for (let index = firstBin; index <= lastBin; index += 1) {
      const overlap = Math.max(
        0,
        Math.min(candleHigh, bins[index].priceMax) - Math.max(candleLow, bins[index].priceMin),
      );
      bins[index].volume += candle.volume * (overlap / candleRange);
    }
  }

  const pocIndex = bins.reduce(
    (highestVolumeIndex, bin, index) =>
      bin.volume > bins[highestVolumeIndex].volume ? index : highestVolumeIndex,
    0,
  );

  return bins.map((bin, index) => ({ ...bin, isPOC: index === pocIndex }));
}