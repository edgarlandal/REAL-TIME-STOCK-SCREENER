import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Stock } from "@/types/stock";
import type { WSMessage } from "@/types/websocket";
import { useWebSocket, type WebSocketLike } from "../useWebSocket";
import { useStockStore } from "@/store/stockStore";

class MockWebSocket implements WebSocketLike {
  readyState: number = WebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  send = vi.fn();

  close(): void {
    this.readyState = WebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close"));
  }

  open(): void {
    this.readyState = WebSocket.OPEN;
    this.onopen?.(new Event("open"));
  }

  receive(message: WSMessage): void {
    this.onmessage?.(new MessageEvent("message", { data: JSON.stringify(message) }));
  }
}

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

describe("useWebSocket integration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useStockStore.getState().clearStocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("backs off after network drops and applies message bursts on the next animation frame", () => {
    const sockets: MockWebSocket[] = [];
    let frameCallback: FrameRequestCallback | undefined;
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      frameCallback = callback;
      return 1;
    });
    vi.stubGlobal("requestAnimationFrame", requestFrame);
    useStockStore.getState().setStocks([createStock()]);

    const { result } = renderHook(() =>
      useWebSocket("ws://example.test/stocks", {
        baseDelay: 100,
        maxDelay: 1_000,
        webSocketFactory: () => {
          const socket = new MockWebSocket();
          sockets.push(socket);
          return socket;
        },
        onMessage: (message) => useStockStore.getState().applyWebSocketMessage(message),
      }),
    );

    act(() => sockets[0].open());
    act(() =>
      sockets[0].receive({
        type: "BATCH_UPDATE",
        timestamp: 1,
        payload: [{ symbol: "ACME", changes: { price: 104, ltp: 104 } }],
      }),
    );

    expect(useStockStore.getState().stocks[0].price).toBe(100);
    expect(requestFrame).toHaveBeenCalledTimes(1);

    act(() => frameCallback?.(16));
    expect(useStockStore.getState().stocks[0].price).toBe(104);

    act(() => sockets[0].close());
    expect(result.current.retryCount).toBe(1);
    act(() => vi.advanceTimersByTime(99));
    expect(sockets).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1));
    expect(sockets).toHaveLength(2);

    act(() => sockets[1].close());
    expect(result.current.retryCount).toBe(2);
    act(() => vi.advanceTimersByTime(199));
    expect(sockets).toHaveLength(2);
    act(() => vi.advanceTimersByTime(1));
    expect(sockets).toHaveLength(3);
  });
});