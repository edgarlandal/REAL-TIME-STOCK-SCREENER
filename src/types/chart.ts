export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SMAResult {
  time: number;
  value: number;
}

export interface EMAResult {
  time: number;
  value: number;
}

export interface RSIResult {
  time: number;
  value: number;
}

export interface BollingerBandsResult {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

export interface VolumeProfileBin {
  priceMin: number;
  priceMax: number;
  volume: number;
  isPOC: boolean;
}