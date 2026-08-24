"use client";

import { Bell, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Stock } from "@/types/stock";

export type PriceAlertCondition = "above" | "below";

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: PriceAlertCondition;
  targetPrice: number;
  triggered: boolean;
}

interface Toast {
  id: string;
  message: string;
}

interface PriceAlertsProps {
  stocks: Array<Pick<Stock, "symbol" | "price">>;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function PriceAlerts({ stocks }: PriceAlertsProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [symbol, setSymbol] = useState("");
  const [condition, setCondition] = useState<PriceAlertCondition>("above");
  const [targetPrice, setTargetPrice] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(1);
  const toastTimersRef = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    return () => {
      for (const timer of toastTimersRef.current) {
        clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    const pricesBySymbol = new Map<string, number>();

    for (let index = 0; index < stocks.length; index += 1) {
      pricesBySymbol.set(stocks[index].symbol, stocks[index].price);
    }

    const triggeredAlerts: Array<PriceAlert & { currentPrice: number }> = [];

    for (let index = 0; index < alerts.length; index += 1) {
      const alert = alerts[index];
      const currentPrice = pricesBySymbol.get(alert.symbol);

      if (alert.triggered || currentPrice === undefined) {
        continue;
      }

      const reachedTarget =
        alert.condition === "above"
          ? currentPrice >= alert.targetPrice
          : currentPrice <= alert.targetPrice;

      if (reachedTarget) {
        triggeredAlerts.push({ ...alert, currentPrice });
      }
    }

    if (triggeredAlerts.length === 0) {
      return;
    }

    const triggeredIds = new Set(triggeredAlerts.map(({ id }) => id));
    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) => (triggeredIds.has(alert.id) ? { ...alert, triggered: true } : alert)),
    );

    for (let index = 0; index < triggeredAlerts.length; index += 1) {
      const alert = triggeredAlerts[index];
      const toastId = `toast-${nextIdRef.current++}`;
      const message = `${alert.symbol} alcanzó ${currencyFormatter.format(alert.currentPrice)} (${alert.condition === "above" ? ">=" : "<="} ${currencyFormatter.format(alert.targetPrice)})`;

      setToasts((currentToasts) => [...currentToasts, { id: toastId, message }]);
      const timer = setTimeout(() => {
        toastTimersRef.current.delete(timer);
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
      }, 5_000);
      toastTimersRef.current.add(timer);
    }
  }, [alerts, stocks]);

  function addAlert(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const parsedTargetPrice = Number(targetPrice);
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (normalizedSymbol === "" || !Number.isFinite(parsedTargetPrice) || parsedTargetPrice <= 0) {
      return;
    }

    setAlerts((currentAlerts) => [
      ...currentAlerts,
      {
        id: `alert-${nextIdRef.current++}`,
        symbol: normalizedSymbol,
        condition,
        targetPrice: parsedTargetPrice,
        triggered: false,
      },
    ]);
    setTargetPrice("");
  }

  function removeAlert(alertId: string): void {
    setAlerts((currentAlerts) => currentAlerts.filter(({ id }) => id !== alertId));
  }

  return (
    <section aria-label="Alertas de precio" className="w-full border border-white/10 bg-financial-card p-4">
      <header className="mb-4 flex items-center gap-2">
        <Bell aria-hidden="true" className="size-4 text-gain-bright" />
        <h2 className="text-sm font-semibold text-zinc-100">Alertas de Precio</h2>
      </header>
      <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_8rem_auto]" onSubmit={addAlert}>
        <label className="sr-only" htmlFor="alert-symbol">
          Símbolo
        </label>
        <input
          id="alert-symbol"
          list="alert-symbols"
          value={symbol}
          placeholder="RELIANCE"
          className="h-9 min-w-0 border border-white/10 bg-background px-3 text-sm uppercase text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-gain/60"
          onChange={(event) => setSymbol(event.target.value)}
        />
        <datalist id="alert-symbols">
          {stocks.map((stock) => (
            <option key={stock.symbol} value={stock.symbol} />
          ))}
        </datalist>
        <label className="sr-only" htmlFor="alert-condition">
          Condición
        </label>
        <select
          id="alert-condition"
          value={condition}
          className="h-9 border border-white/10 bg-background px-2 text-sm text-zinc-100 outline-none focus:border-gain/60"
          onChange={(event) => setCondition(event.target.value as PriceAlertCondition)}
        >
          <option value="above">Mayor que</option>
          <option value="below">Menor que</option>
        </select>
        <label className="sr-only" htmlFor="alert-price">
          Precio objetivo
        </label>
        <input
          id="alert-price"
          value={targetPrice}
          inputMode="decimal"
          placeholder="2500"
          className="h-9 min-w-0 border border-white/10 bg-background px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-gain/60"
          onChange={(event) => setTargetPrice(event.target.value)}
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center gap-1 border border-gain/50 bg-gain/15 px-3 text-sm font-medium text-gain-bright hover:bg-gain/25"
        >
          <Plus aria-hidden="true" className="size-4" />
          Añadir
        </button>
      </form>
      <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
        {alerts.length === 0 ? (
          <li className="py-3 text-sm text-zinc-500">Configura una alerta para recibir notificaciones por tick.</li>
        ) : (
          alerts.map((alert) => (
            <li key={alert.id} className="flex min-h-10 items-center justify-between gap-3 py-2 text-sm">
              <span className={alert.triggered ? "text-zinc-500 line-through" : "text-zinc-200"}>
                {alert.symbol} {alert.condition === "above" ? ">" : "<"} {currencyFormatter.format(alert.targetPrice)}
              </span>
              <button
                type="button"
                aria-label={`Eliminar alerta ${alert.symbol}`}
                className="flex size-7 items-center justify-center text-zinc-400 hover:text-loss-bright"
                onClick={() => removeAlert(alert.id)}
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))
        )}
      </ul>
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} role="status" className="pointer-events-auto border border-gain/40 bg-financial-card p-3 text-sm text-zinc-100 shadow-lg shadow-black/40">
            {toast.message}
          </div>
        ))}
      </div>
    </section>
  );
}