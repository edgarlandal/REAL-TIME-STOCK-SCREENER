export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCapCategory: "large-cap" | "mid-cap" | "small-cap" | "micro-cap";
  price: number;
  ltp: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  avgVolume30: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  pe: number;
  pb: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  dividendYield: number;
  eps: number;
  promoterHolding: number;
  freeCashFlow: number;
  salesGrowth: number;
  rsi14: number;
  sma20: number;
  sma50: number;
  sma200: number;
  macd: number;
  macdSignal: number;
  volumeProfilePeak: number;
  isWatchlist: boolean;
  lastUpdated: Date;
}

export type StockNumericField = {
  [Key in keyof Stock]: Stock[Key] extends number ? Key : never;
}[keyof Stock];

export const STOCK_NUMERIC_FIELDS: readonly StockNumericField[] = [
  "price",
  "ltp",
  "change",
  "changePercent",
  "open",
  "high",
  "low",
  "close",
  "volume",
  "avgVolume30",
  "fiftyTwoWeekHigh",
  "fiftyTwoWeekLow",
  "pe",
  "pb",
  "roe",
  "roce",
  "debtToEquity",
  "dividendYield",
  "eps",
  "promoterHolding",
  "freeCashFlow",
  "salesGrowth",
  "rsi14",
  "sma20",
  "sma50",
  "sma200",
  "macd",
  "macdSignal",
  "volumeProfilePeak",
];