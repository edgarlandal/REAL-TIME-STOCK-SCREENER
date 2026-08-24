import { describe, expect, it } from "vitest";
import type { FilterGroup } from "@/types/filter";
import type { Stock } from "@/types/stock";
import { benchmarkFilter } from "../benchmark";
import { filterStocks } from "../astEngine";

function createMockStocks(count: number): Stock[] {
  const stocks: Stock[] = [];

  for (let index = 0; index < count; index += 1) {
    const price = 100 + (index % 50);

    stocks.push({
      symbol: `STOCK-${index}`,
      name: `Mock Stock ${index}`,
      sector: "Technology",
      industry: "Software",
      marketCapCategory: "large-cap",
      price,
      ltp: price,
      change: 1,
      changePercent: 1,
      open: price - 1,
      high: price + 1,
      low: price - 2,
      close: price,
      volume: 2_000_000,
      avgVolume30: 1_000_000,
      fiftyTwoWeekHigh: 180,
      fiftyTwoWeekLow: 80,
      pe: 20,
      pb: 3,
      roe: 18,
      roce: 16,
      debtToEquity: 0.4,
      dividendYield: 2.5,
      eps: 5,
      promoterHolding: 50,
      freeCashFlow: 1_000_000,
      salesGrowth: 20,
      rsi14: 55,
      sma20: price - 2,
      sma50: price - 3,
      sma200: price - 4,
      macd: 1,
      macdSignal: 0.5,
      volumeProfilePeak: price,
      isWatchlist: false,
      lastUpdated: new Date(0),
    });
  }

  return stocks;
}

const mockStocks = createMockStocks(5_000);

const twelveFilterCriteria: FilterGroup = {
  id: "integration-criteria",
  logic: "AND",
  criteria: [
    { id: "watchlist", field: "isWatchlist", category: "watchlist", operator: "equals", filter: { value: false } },
    { id: "sector", field: "sector", category: "identity", operator: "in", filter: { values: ["Technology"] } },
    { id: "market-cap", field: "marketCapCategory", category: "identity", operator: "in", filter: { values: ["large-cap"] } },
    { id: "price", field: "price", category: "market-data", operator: "between", filter: { min: 90, max: 160 } },
    { id: "pe", field: "pe", category: "valuation", operator: "between", filter: { min: 10, max: 30 } },
    { id: "pb", field: "pb", category: "valuation", operator: "between", filter: { min: 1, max: 5 } },
    { id: "volume", field: "volume", category: "volume", operator: "between", filter: { min: 1_000_000, max: 3_000_000 } },
    { id: "roe", field: "roe", category: "profitability", operator: "between", filter: { min: 10, max: 25 } },
    { id: "roce", field: "roce", category: "profitability", operator: "between", filter: { min: 10, max: 25 } },
    { id: "debt", field: "debtToEquity", category: "financial-health", operator: "between", filter: { min: 0, max: 1 } },
    { id: "sales-growth", field: "salesGrowth", category: "profitability", operator: "between", filter: { min: 10, max: 30 } },
    { id: "rsi", field: "rsi14", category: "technical", operator: "between", filter: { min: 40, max: 70 } },
  ],
};

describe("filter engine integration", () => {
  it("filters 5,000 stocks through 12 simultaneous criteria under 100ms consistently", () => {
    filterStocks(mockStocks, twelveFilterCriteria);

    for (let iteration = 0; iteration < 5; iteration += 1) {
      const result = benchmarkFilter(mockStocks, twelveFilterCriteria);

      expect(result.matchedCount).toBe(5_000);
      expect(result.isSpeedDemon).toBe(true);
      expect(result.durationMs).toBeLessThan(100);
    }
  });
});