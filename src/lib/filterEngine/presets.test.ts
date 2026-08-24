import { describe, expect, it } from "vitest";
import type { Stock } from "@/types/stock";
import { filterStocks } from "./astEngine";
import { INVESTMENT_PRESETS } from "./presets";

function createStock(overrides: Partial<Stock> = {}): Stock {
  return {
    symbol: "ACME",
    name: "Acme Corp",
    sector: "Technology",
    industry: "Software",
    marketCapCategory: "large-cap",
    price: 110,
    ltp: 110,
    change: 0,
    changePercent: 0,
    open: 110,
    high: 110,
    low: 110,
    close: 110,
    volume: 2_000,
    avgVolume30: 1_000,
    fiftyTwoWeekHigh: 120,
    fiftyTwoWeekLow: 80,
    pe: 10,
    pb: 1,
    roe: 15,
    roce: 15,
    debtToEquity: 0.3,
    dividendYield: 3,
    eps: 5,
    promoterHolding: 50,
    freeCashFlow: 1_000,
    salesGrowth: 20,
    rsi14: 65,
    sma20: 100,
    sma50: 100,
    sma200: 100,
    macd: 0,
    macdSignal: 0,
    volumeProfilePeak: 100,
    isWatchlist: false,
    lastUpdated: new Date(0),
    ...overrides,
  };
}

describe("investment presets", () => {
  it("exports the four predefined investment strategies", () => {
    expect(INVESTMENT_PRESETS.map(({ name }) => name)).toEqual([
      "Value Stocks",
      "Growth Momentum",
      "Large Cap Quality",
      "Technical Breakout",
    ]);
  });

  it("executes each preset against its documented conditions", () => {
    const stock = createStock();

    for (let index = 0; index < INVESTMENT_PRESETS.length; index += 1) {
      expect(filterStocks([stock], INVESTMENT_PRESETS[index].criteria)).toEqual([stock]);
    }
  });

  it("requires price and volume to exceed their technical breakout thresholds", () => {
    const breakout = INVESTMENT_PRESETS[3];
    const belowPrice = createStock({ price: 100 });
    const belowVolume = createStock({ volume: 1_500 });

    expect(filterStocks([belowPrice], breakout.criteria)).toEqual([]);
    expect(filterStocks([belowVolume], breakout.criteria)).toEqual([]);
  });
});