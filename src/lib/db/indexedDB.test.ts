import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CandleData } from "@/types/chart";
import type { Stock } from "@/types/stock";
import {
  cachePriceHistory,
  cacheStocks,
  loadCachedPriceHistory,
  loadCachedStocks,
  loadStocksWithCache,
} from "./indexedDB";

const DATABASE_NAME = "real-time-stock-screener";

function createStock(): Stock {
  return {
    symbol: "ACME",
    name: "Acme Corp",
    sector: "Technology",
    industry: "Software",
    marketCapCategory: "large-cap",
    price: 100,
    ltp: 100,
    change: 0,
    changePercent: 0,
    open: 100,
    high: 100,
    low: 100,
    close: 100,
    volume: 1_000,
    avgVolume30: 1_000,
    fiftyTwoWeekHigh: 120,
    fiftyTwoWeekLow: 80,
    pe: 20,
    pb: 2,
    roe: 10,
    roce: 10,
    debtToEquity: 1,
    dividendYield: 1,
    eps: 5,
    promoterHolding: 50,
    freeCashFlow: 1_000,
    salesGrowth: 10,
    rsi14: 50,
    sma20: 100,
    sma50: 100,
    sma200: 100,
    macd: 0,
    macdSignal: 0,
    volumeProfilePeak: 100,
    isWatchlist: false,
    lastUpdated: new Date(0),
  };
}

function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DATABASE_NAME);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

describe("IndexedDB stock cache", () => {
  beforeEach(async () => {
    await deleteDatabase();
  });

  afterEach(() => vi.restoreAllMocks());

  it("persists the stock universe and price history", async () => {
    const stock = createStock();
    const candles: CandleData[] = [{ time: 1, open: 100, high: 101, low: 99, close: 100, volume: 1_000 }];

    await cacheStocks([stock], 100);
    await cachePriceHistory(stock.symbol, candles, 200);

    await expect(loadCachedStocks()).resolves.toEqual({ data: [stock], cachedAt: 100, source: "cache" });
    await expect(loadCachedPriceHistory(stock.symbol)).resolves.toEqual({
      data: candles,
      cachedAt: 200,
      source: "cache",
    });
  });

  it("loads cached stocks transparently while offline", async () => {
    const stock = createStock();
    const originalOnline = Object.getOwnPropertyDescriptor(navigator, "onLine");
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
    const fetchStocks = vi.fn(async () => [stock]);
    await cacheStocks([stock], 100);

    await expect(loadStocksWithCache(fetchStocks)).resolves.toEqual({
      data: [stock],
      cachedAt: 100,
      source: "cache",
    });
    expect(fetchStocks).not.toHaveBeenCalled();

    if (originalOnline !== undefined) {
      Object.defineProperty(navigator, "onLine", originalOnline);
    }
  });
});