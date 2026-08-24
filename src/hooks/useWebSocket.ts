"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ConnectionStatus, WSMessage } from "@/types/websocket";

const MAX_BACKOFF_EXPONENT = 30;

export interface WebSocketLike {
  readyState: number;
  onopen: ((event: Event) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent<unknown>) => void) | null;
  close: () => void;
  send: (data: string) => void;
}

export interface UseWebSocketOptions {
  baseDelay?: number;
  maxDelay?: number;
  webSocketFactory?: (url: string) => WebSocketLike;
  onMessage?: (message: WSMessage) => void;
}

export interface UseWebSocketResult {
  connectionStatus: ConnectionStatus;
  retryCount: number;
  send: (message: WSMessage) => boolean;
  disconnect: () => void;
}

export function getReconnectDelay(baseDelay: number, maxDelay: number, retryCount: number): number {
  const safeRetryCount = Math.min(Math.max(retryCount, 0), MAX_BACKOFF_EXPONENT);
  return Math.min(maxDelay, baseDelay * Math.pow(2, safeRetryCount));
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}): UseWebSocketResult {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("DISCONNECTED");
  const [retryCount, setRetryCount] = useState(0);
  const socketRef = useRef<WebSocketLike | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retryCountRef = useRef(0);
  const manuallyDisconnectedRef = useRef(false);
  const onMessageRef = useRef(options.onMessage);
  const baseDelay = options.baseDelay ?? 500;
  const maxDelay = options.maxDelay ?? 30_000;
  const factoryRef = useRef<(socketUrl: string) => WebSocketLike>(
    options.webSocketFactory ?? ((socketUrl) => new WebSocket(socketUrl)),
  );

  onMessageRef.current = options.onMessage;

  const disconnect = useCallback(() => {
    manuallyDisconnectedRef.current = true;

    if (reconnectTimerRef.current !== undefined) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = undefined;
    }

    socketRef.current?.close();
    socketRef.current = null;
    retryCountRef.current = 0;
    setRetryCount(0);
    setConnectionStatus("DISCONNECTED");
  }, []);

  const send = useCallback((message: WSMessage): boolean => {
    const socket = socketRef.current;

    if (socket === null || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify(message));
    return true;
  }, []);

  useEffect(() => {
    let disposed = false;
    manuallyDisconnectedRef.current = false;

    const connect = (): void => {
      if (disposed || manuallyDisconnectedRef.current) {
        return;
      }

      setConnectionStatus(retryCountRef.current === 0 ? "CONNECTING" : "RECONNECTING");

      let socket: WebSocketLike;

      try {
        socket = factoryRef.current(url);
      } catch {
        scheduleReconnect();
        return;
      }

      socketRef.current = socket;
      socket.onopen = () => {
        if (disposed || socketRef.current !== socket) {
          return;
        }

        retryCountRef.current = 0;
        setRetryCount(0);
        setConnectionStatus("CONNECTED");
      };
      socket.onmessage = (event) => {
        if (typeof event.data !== "string") {
          return;
        }

        try {
          onMessageRef.current?.(JSON.parse(event.data) as WSMessage);
        } catch {
          // Ignore malformed messages and keep the connection available.
        }
      };
      socket.onerror = () => socket.close();
      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (!disposed && !manuallyDisconnectedRef.current) {
          scheduleReconnect();
        }
      };
    };

    const scheduleReconnect = (): void => {
      if (disposed || manuallyDisconnectedRef.current || reconnectTimerRef.current !== undefined) {
        return;
      }

      const delay = getReconnectDelay(baseDelay, maxDelay, retryCountRef.current);
      retryCountRef.current = Math.min(retryCountRef.current + 1, MAX_BACKOFF_EXPONENT);
      setRetryCount(retryCountRef.current);
      setConnectionStatus("RECONNECTING");
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = undefined;
        connect();
      }, delay);
    };

    connect();

    return () => {
      disposed = true;

      if (reconnectTimerRef.current !== undefined) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = undefined;
      }

      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [baseDelay, maxDelay, url]);

  return { connectionStatus, retryCount, send, disconnect };
}