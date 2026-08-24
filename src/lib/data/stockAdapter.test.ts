import { describe, expect, it } from "vitest";
import { adaptStock, parseFiniteNumber } from "./stockAdapter";

function createPayload(): Record<string, unknown> {
  return {
    symbol: "ACME",
    name: "Acme Corp",
    sector: "Technology",
    industry: "Software",
    marketCapCategory: "large-cap",
    price: "100.25",
    ltp: 100.25,
    change: -1,
    changePercent: "-0.99",
    open: 101,
    high: 102,
    low: 99,
    close: 100.25,
    volume: "1000000",
    avgVolume30: 900000,
    fiftyTwoWeekHigh: 120,
    fiftyTwoWeekLow: 80,
    pe: "20",
    pb: 2,
    roe: 10,
    roce: 10,
    debtToEquity: 1,
    dividendYield: 1,
    eps: 5,
    promoterHolding: 50,
    freeCashFlow: 1000,
    salesGrowth: 10,
    rsi14: 50,
    sma20: 100,
    sma50: 100,
    sma200: 100,
    macd: 0,
    macdSignal: 0,
    volumeProfilePeak: 100,
    isWatchlist: false,
    lastUpdated: "2026-08-24T00:00:00.000Z",
  };
}

describe("adaptStock", () => {
  it("converts financial metrics to strict finite numbers", () => {
    const stock = adaptStock(createPayload());

    expect(stock.pe).toBe(20);
    expect(stock.changePercent).toBe(-0.99);
    expect(stock.volume).toBe(1_000_000);
  });

  it("rejects NaN, null, and non-numeric financial metric values", () => {
    expect(() => parseFiniteNumber(Number.NaN, "pe")).toThrow(/finite number/);
    expect(() => adaptStock({ ...createPayload(), changePercent: null })).toThrow(/changePercent/);
    expect(() => adaptStock({ ...createPayload(), volume: "not-a-number" })).toThrow(/volume/);
  });
});