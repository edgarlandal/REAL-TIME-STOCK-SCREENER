import type { Stock } from "@/types/stock";
import type { StockUpdatePayload, WSMessage } from "@/types/websocket";

const TRADING_MILLISECONDS_PER_YEAR = 252 * 6.5 * 60 * 60 * 1_000;

export interface MockWebSocketServerOptions {
  annualDrift?: number;
  annualVolatility?: number;
  sectorCorrelation?: number;
  marketCorrelation?: number;
  tickIntervalMs?: number;
  random?: () => number;
}

type MessageListener = (message: WSMessage) => void;

export class MockStockWebSocketServer {
  private readonly stocks = new Map<string, Stock>();
  private readonly listeners = new Set<MessageListener>();
  private readonly annualDrift: number;
  private readonly annualVolatility: number;
  private readonly sectorCorrelation: number;
  private readonly marketCorrelation: number;
  private readonly tickIntervalMs: number;
  private readonly random: () => number;
  private intervalId: ReturnType<typeof setInterval> | undefined;

  constructor(stocks: Stock[], options: MockWebSocketServerOptions = {}) {
    this.annualDrift = options.annualDrift ?? 0.08;
    this.annualVolatility = options.annualVolatility ?? 0.24;
    this.sectorCorrelation = options.sectorCorrelation ?? 0.5;
    this.marketCorrelation = options.marketCorrelation ?? 0.2;
    this.tickIntervalMs = options.tickIntervalMs ?? 1_000;
    this.random = options.random ?? Math.random;

    if (this.sectorCorrelation < 0 || this.marketCorrelation < 0) {
      throw new RangeError("Correlation weights must be non-negative");
    }

    if (this.sectorCorrelation + this.marketCorrelation > 1) {
      throw new RangeError("Sector and market correlation weights must not exceed 1");
    }

    for (let index = 0; index < stocks.length; index += 1) {
      this.stocks.set(stocks[index].symbol, { ...stocks[index] });
    }
  }

  subscribe(listener: MessageListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  start(): void {
    if (this.intervalId === undefined) {
      this.intervalId = setInterval(() => this.tick(), this.tickIntervalMs);
    }
  }

  stop(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  tick(timestamp = Date.now()): WSMessage {
    const dt = this.tickIntervalMs / TRADING_MILLISECONDS_PER_YEAR;
    const marketShock = standardNormal(this.random);
    const sectorShocks = new Map<string, number>();
    const updates: StockUpdatePayload[] = [];
    const sectorWeight = Math.sqrt(this.sectorCorrelation);
    const marketWeight = Math.sqrt(this.marketCorrelation);
    const idiosyncraticWeight = Math.sqrt(1 - this.sectorCorrelation - this.marketCorrelation);

    for (const stock of this.stocks.values()) {
      let sectorShock = sectorShocks.get(stock.sector);

      if (sectorShock === undefined) {
        sectorShock = standardNormal(this.random);
        sectorShocks.set(stock.sector, sectorShock);
      }

      const idiosyncraticShock = standardNormal(this.random);
      const shock =
        marketWeight * marketShock +
        sectorWeight * sectorShock +
        idiosyncraticWeight * idiosyncraticShock;
      const logReturn =
        (this.annualDrift - (this.annualVolatility * this.annualVolatility) / 2) * dt +
        this.annualVolatility * Math.sqrt(dt) * shock;
      const nextPrice = Math.max(0.01, stock.price * Math.exp(logReturn));
      const change = nextPrice - stock.close;
      const changePercent = stock.close === 0 ? 0 : (change / stock.close) * 100;
      const lastUpdated = new Date(timestamp);

      stock.price = nextPrice;
      stock.ltp = nextPrice;
      stock.close = nextPrice;
      stock.high = Math.max(stock.high, nextPrice);
      stock.low = Math.min(stock.low, nextPrice);
      stock.change = change;
      stock.changePercent = changePercent;
      stock.lastUpdated = lastUpdated;

      updates.push({
        symbol: stock.symbol,
        changes: { price: nextPrice, ltp: nextPrice, close: nextPrice, high: stock.high, low: stock.low, change, changePercent, lastUpdated },
      });
    }

    const message: WSMessage = { type: "BATCH_UPDATE", payload: updates, timestamp };

    for (const listener of this.listeners) {
      listener(message);
    }

    return message;
  }
}

function standardNormal(random: () => number): number {
  const first = Math.max(random(), Number.MIN_VALUE);
  const second = random();
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}