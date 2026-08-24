import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Stock } from "@/types/stock";
import { useStockStore } from "./stockStore";

function createStock(symbol: string): Stock {
  return {
    symbol,
    name: symbol,
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

describe("useStockStore", () => {
  beforeEach(() => {
    useStockStore.getState().clearStocks();
  });

  afterEach(() => vi.unstubAllGlobals());

  it("coalesces WebSocket updates by symbol and flushes once per animation frame", () => {
    let frameCallback: FrameRequestCallback | undefined;
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      frameCallback = callback;
      return 1;
    });
    vi.stubGlobal("requestAnimationFrame", requestFrame);
    useStockStore.getState().setStocks([createStock("ACME")]);

    useStockStore.getState().queueUpdates([
      { symbol: "ACME", changes: { price: 101, change: 1 } },
      { symbol: "ACME", changes: { ltp: 102, changePercent: 2 } },
    ]);

    expect(requestFrame).toHaveBeenCalledTimes(1);
    expect(useStockStore.getState().stocks[0].price).toBe(100);

    frameCallback?.(16);

    const updatedStock = useStockStore.getState().stocksBySymbol.get("ACME");
    expect(updatedStock).toMatchObject({ price: 101, ltp: 102, change: 1, changePercent: 2 });
  });

  it("queues batch WebSocket messages without updating unknown symbols", () => {
    useStockStore.getState().setStocks([createStock("ACME")]);
    useStockStore.getState().applyWebSocketMessage({
      type: "BATCH_UPDATE",
      timestamp: 1,
      payload: [
        { symbol: "ACME", changes: { price: 105 } },
        { symbol: "MISSING", changes: { price: 200 } },
      ],
    });
    useStockStore.getState().flushPendingUpdates();

    expect(useStockStore.getState().stocks).toHaveLength(1);
    expect(useStockStore.getState().stocks[0].price).toBe(105);
  });
});