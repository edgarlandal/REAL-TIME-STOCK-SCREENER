import { describe, expect, it } from "vitest";
import { MockStockWebSocketServer } from "./mockServer";
import type { Stock } from "@/types/stock";

function createStock(symbol: string, sector: string): Stock {
  return {
    symbol,
    name: symbol,
    sector,
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

describe("MockStockWebSocketServer", () => {
  it("publishes GBM batch updates and applies a common sector shock", () => {
    const randomValues = [0.5, 0.5, 0.5, 0, 0.5, 0.5, 0.5, 0.5];
    const server = new MockStockWebSocketServer(
      [createStock("TECH-A", "Technology"), createStock("TECH-B", "Technology")],
      {
        annualDrift: 0,
        annualVolatility: 0.24,
        sectorCorrelation: 1,
        marketCorrelation: 0,
        random: () => randomValues.shift() ?? 0.5,
      },
    );
    const listener = (message: ReturnType<typeof server.tick>) => received.push(message);
    const received: ReturnType<typeof server.tick>[] = [];
    const unsubscribe = server.subscribe(listener);

    const message = server.tick(1_000);
    unsubscribe();

    expect(message.type).toBe("BATCH_UPDATE");
    expect(received).toEqual([message]);
    expect(Array.isArray(message.payload)).toBe(true);

    const [first, second] = message.payload as Extract<typeof message.payload, unknown[]>;
    expect(first.changes.price).toBeGreaterThan(100);
    expect(first.changes.price).toBeCloseTo(second.changes.price as number, 12);
    expect(first.changes.lastUpdated).toEqual(new Date(1_000));
  });

  it("validates impossible correlation weights", () => {
    expect(
      () =>
        new MockStockWebSocketServer([createStock("ACME", "Technology")], {
          sectorCorrelation: 0.8,
          marketCorrelation: 0.3,
        }),
    ).toThrow(RangeError);
  });
});