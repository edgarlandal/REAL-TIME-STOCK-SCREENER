import { describe, expect, it } from "vitest";
import type { Stock } from "@/types/stock";
import {
  industries,
  isWatchlist,
  matchesStockPredicates,
  maxPE,
  maxPrice,
  maxRSI,
  minPE,
  minPrice,
  minRSI,
  sectors,
} from "./predicates";

const stock: Stock = {
  symbol: "ACME",
  name: "Acme Corp",
  sector: "Technology",
  industry: "Software",
  marketCapCategory: "large-cap",
  price: 120,
  ltp: 120,
  change: 0,
  changePercent: 0,
  open: 120,
  high: 120,
  low: 120,
  close: 120,
  volume: 1_000_000,
  avgVolume30: 1_000_000,
  fiftyTwoWeekHigh: 140,
  fiftyTwoWeekLow: 80,
  pe: 24,
  pb: 4,
  roe: 18,
  roce: 16,
  debtToEquity: 0.4,
  dividendYield: 1.2,
  eps: 5,
  promoterHolding: 50,
  freeCashFlow: 1_000,
  rsi14: 55,
  sma20: 120,
  sma50: 120,
  sma200: 120,
  macd: 0,
  macdSignal: 0,
  volumeProfilePeak: 120,
  isWatchlist: true,
  lastUpdated: new Date(0),
};

describe("stock predicates", () => {
  it("evaluates pure numeric, multiselect, and boolean predicates", () => {
    expect(minPrice(stock, 120)).toBe(true);
    expect(maxPrice(stock, 119)).toBe(false);
    expect(minPE(stock, 24)).toBe(true);
    expect(maxPE(stock, 23)).toBe(false);
    expect(minRSI(stock, 55)).toBe(true);
    expect(maxRSI(stock, 54)).toBe(false);
    expect(sectors(stock, ["Energy", "Technology"])).toBe(true);
    expect(industries(stock, ["Banks"])).toBe(false);
    expect(isWatchlist(stock, true)).toBe(true);
  });

  it("short-circuits selective criteria before numeric checks", () => {
    const rejectedStock = { ...stock, isWatchlist: false, price: Number.NaN };

    expect(
      matchesStockPredicates(rejectedStock, {
        isWatchlist: true,
        minPrice: 100,
      }),
    ).toBe(false);
  });

  it("accepts a stock only when every enabled predicate matches", () => {
    expect(
      matchesStockPredicates(stock, {
        isWatchlist: true,
        sectors: ["Technology"],
        industries: ["Software"],
        minPrice: 100,
        maxPrice: 130,
        minRSI: 50,
        maxRSI: 60,
      }),
    ).toBe(true);
  });
});