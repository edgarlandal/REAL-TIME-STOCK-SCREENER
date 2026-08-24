import { create } from "zustand";
import type { Stock } from "@/types/stock";
import type { StockUpdatePayload, WSMessage } from "@/types/websocket";

export type StockUpdate = StockUpdatePayload;

interface StockStoreState {
  stocks: Stock[];
  stocksBySymbol: Map<string, Stock>;
  setStocks: (stocks: Stock[]) => void;
  queueUpdates: (updates: StockUpdate[]) => void;
  applyWebSocketMessage: (message: WSMessage) => void;
  flushPendingUpdates: () => void;
  clearStocks: () => void;
}

let pendingUpdates = new Map<string, StockUpdate>();
let frameScheduled = false;

function scheduleFrame(callback: FrameRequestCallback): void {
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(callback);
    return;
  }

  setTimeout(() => callback(Date.now()), 16);
}

export const useStockStore = create<StockStoreState>()((set, get) => {
  function flushPendingUpdates(): void {
    frameScheduled = false;

    if (pendingUpdates.size === 0) {
      return;
    }

    const updates = pendingUpdates;
    pendingUpdates = new Map<string, StockUpdate>();
    const stocksBySymbol = new Map(get().stocksBySymbol);

    for (const [symbol, update] of updates) {
      const currentStock = stocksBySymbol.get(symbol);

      if (currentStock !== undefined) {
        stocksBySymbol.set(symbol, { ...currentStock, ...update.changes });
      }
    }

    const stocks = get().stocks.map((stock) => stocksBySymbol.get(stock.symbol) ?? stock);
    set({ stocks, stocksBySymbol });
  }

  function queueUpdates(updates: StockUpdate[]): void {
    for (let index = 0; index < updates.length; index += 1) {
      const update = updates[index];
      const bufferedUpdate = pendingUpdates.get(update.symbol);

      pendingUpdates.set(update.symbol, {
        symbol: update.symbol,
        changes: { ...bufferedUpdate?.changes, ...update.changes },
      });
    }

    if (!frameScheduled && pendingUpdates.size > 0) {
      frameScheduled = true;
      scheduleFrame(() => get().flushPendingUpdates());
    }
  }

  return {
    stocks: [],
    stocksBySymbol: new Map<string, Stock>(),
    setStocks: (stocks) => {
      pendingUpdates = new Map<string, StockUpdate>();
      const stocksBySymbol = new Map<string, Stock>();

      for (let index = 0; index < stocks.length; index += 1) {
        stocksBySymbol.set(stocks[index].symbol, stocks[index]);
      }

      set({ stocks, stocksBySymbol });
    },
    queueUpdates,
    applyWebSocketMessage: (message) => {
      const updates = Array.isArray(message.payload) ? message.payload : [message.payload];
      get().queueUpdates(updates);
    },
    flushPendingUpdates,
    clearStocks: () => {
      pendingUpdates = new Map<string, StockUpdate>();
      set({ stocks: [], stocksBySymbol: new Map<string, Stock>() });
    },
  };
});