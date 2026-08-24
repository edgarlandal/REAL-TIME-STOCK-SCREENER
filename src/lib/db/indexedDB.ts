import type { CandleData } from "@/types/chart";
import type { Stock } from "@/types/stock";

const DATABASE_NAME = "real-time-stock-screener";
const DATABASE_VERSION = 1;
const STOCKS_STORE = "stocks";
const PRICE_HISTORY_STORE = "price-history";
const STOCK_UNIVERSE_KEY = "universe";

interface StockCacheRecord {
  id: typeof STOCK_UNIVERSE_KEY;
  stocks: Stock[];
  cachedAt: number;
}

interface PriceHistoryCacheRecord {
  symbol: string;
  candles: CandleData[];
  cachedAt: number;
}

export interface CachedData<T> {
  data: T;
  cachedAt: number;
  source: "network" | "cache";
}

export function openStockCacheDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment"));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STOCKS_STORE)) {
        database.createObjectStore(STOCKS_STORE, { keyPath: "id" });
      }

      if (!database.objectStoreNames.contains(PRICE_HISTORY_STORE)) {
        database.createObjectStore(PRICE_HISTORY_STORE, { keyPath: "symbol" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export async function cacheStocks(stocks: Stock[], cachedAt = Date.now()): Promise<void> {
  const database = await openStockCacheDatabase();
  await writeRecord(database, STOCKS_STORE, { id: STOCK_UNIVERSE_KEY, stocks, cachedAt });
  database.close();
}

export async function loadCachedStocks(): Promise<CachedData<Stock[]> | null> {
  const database = await openStockCacheDatabase();
  const record = await readRecord<StockCacheRecord>(database, STOCKS_STORE, STOCK_UNIVERSE_KEY);
  database.close();

  return record === undefined ? null : { data: record.stocks, cachedAt: record.cachedAt, source: "cache" };
}

export async function cachePriceHistory(
  symbol: string,
  candles: CandleData[],
  cachedAt = Date.now(),
): Promise<void> {
  const database = await openStockCacheDatabase();
  await writeRecord(database, PRICE_HISTORY_STORE, { symbol, candles, cachedAt });
  database.close();
}

export async function loadCachedPriceHistory(symbol: string): Promise<CachedData<CandleData[]> | null> {
  const database = await openStockCacheDatabase();
  const record = await readRecord<PriceHistoryCacheRecord>(database, PRICE_HISTORY_STORE, symbol);
  database.close();

  return record === undefined ? null : { data: record.candles, cachedAt: record.cachedAt, source: "cache" };
}

export async function loadStocksWithCache(fetchStocks: () => Promise<Stock[]>): Promise<CachedData<Stock[]>> {
  return loadWithCache(fetchStocks, cacheStocks, loadCachedStocks);
}

export async function loadPriceHistoryWithCache(
  symbol: string,
  fetchHistory: () => Promise<CandleData[]>,
): Promise<CachedData<CandleData[]>> {
  return loadWithCache(fetchHistory, (candles) => cachePriceHistory(symbol, candles), () => loadCachedPriceHistory(symbol));
}

async function loadWithCache<T>(
  fetchData: () => Promise<T>,
  cacheData: (data: T) => Promise<void>,
  loadCachedData: () => Promise<CachedData<T> | null>,
): Promise<CachedData<T>> {
  if (isOnline()) {
    try {
      const data = await fetchData();
      const cachedAt = Date.now();
      await cacheData(data);
      return { data, cachedAt, source: "network" };
    } catch {
      // A stale cache is preferable to an unavailable screener when the network fails.
    }
  }

  const cachedData = await loadCachedData();

  if (cachedData !== null) {
    return cachedData;
  }

  throw new Error("No network connection and no cached data is available");
}

function isOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

function readRecord<T>(database: IDBDatabase, storeName: string, key: IDBValidKey): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, "readonly").objectStore(storeName).get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T | undefined);
  });
}

function writeRecord(database: IDBDatabase, storeName: string, record: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, "readwrite").objectStore(storeName).put(record);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}