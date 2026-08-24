import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getReconnectDelay,
  getScheduledReconnectDelay,
  useWebSocket,
  type WebSocketLike,
} from "./useWebSocket";

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
}

describe("useWebSocket", () => {
  afterEach(() => vi.useRealTimers());

  it("caps exponential reconnect delays before integer overflow", () => {
    expect(getReconnectDelay(500, 30_000, 0)).toBe(500);
    expect(getReconnectDelay(500, 30_000, 3)).toBe(4_000);
    expect(getReconnectDelay(500, 30_000, 9_999)).toBe(30_000);
  });

  it("uses the last scheduled delay when retries exceed the configured delay array", () => {
    const delays = [100, 250, 500];

    expect(getScheduledReconnectDelay(delays, 0)).toBe(100);
    expect(getScheduledReconnectDelay(delays, 2)).toBe(500);
    expect(getScheduledReconnectDelay(delays, 999)).toBe(500);
  });

  it("reconnects after a closed connection and resets retries on open", () => {
    vi.useFakeTimers();
    const sockets: MockWebSocket[] = [];
    const { result } = renderHook(() =>
      useWebSocket("ws://example.test/stocks", {
        baseDelay: 100,
        webSocketFactory: () => {
          const socket = new MockWebSocket();
          sockets.push(socket);
          return socket;
        },
      }),
    );

    expect(result.current.connectionStatus).toBe("CONNECTING");

    act(() => sockets[0].close());
    expect(result.current.connectionStatus).toBe("RECONNECTING");
    expect(result.current.retryCount).toBe(1);

    act(() => vi.advanceTimersByTime(100));
    expect(sockets).toHaveLength(2);

    act(() => sockets[1].open());
    expect(result.current.connectionStatus).toBe("CONNECTED");
    expect(result.current.retryCount).toBe(0);
  });
});