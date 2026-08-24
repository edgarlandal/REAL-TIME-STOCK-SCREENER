import type { Stock } from "@/types/stock";

export interface StockUpdatePayload {
  symbol: string;
  changes: Partial<Stock>;
}

export interface WSMessage {
  type: "STOCK_UPDATE" | "BATCH_UPDATE";
  payload: StockUpdatePayload | StockUpdatePayload[];
  timestamp: number;
}

export type ConnectionStatus = "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "RECONNECTING";

export type BatchUpdateMap = Map<string, Partial<Stock>>;