"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { CandleData } from "@/types/chart";
import { RSIChart } from "@/components/chart/RSIChart";

export interface StockChartOverlays {
  sma20: boolean;
  sma50: boolean;
  sma200: boolean;
  bollinger: boolean;
}

export interface ChartLogicalRange {
  from: number;
  to: number;
}

interface StockChartProps {
  data: CandleData[];
  height?: number;
}

const StockChartClient = dynamic(
  () => import("./StockChartClient").then((module) => module.StockChartClient),
  {
    ssr: false,
    loading: () => (
      <div
        aria-label="Cargando gráfico"
        className="w-full border border-white/10 bg-financial-card"
        style={{ height: 420 }}
      />
    ),
  },
);

export function StockChart({ data, height = 420 }: StockChartProps) {
  const [overlays, setOverlays] = useState<StockChartOverlays>({
    sma20: false,
    sma50: false,
    sma200: false,
    bollinger: false,
  });
  const [visibleRange, setVisibleRange] = useState<ChartLogicalRange | null>(null);

  function toggleOverlay(overlay: keyof StockChartOverlays): void {
    setOverlays((currentOverlays) => ({
      ...currentOverlays,
      [overlay]: !currentOverlays[overlay],
    }));
  }

  return (
    <section className="w-full" aria-label="Gráfico de precios">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <OverlayToggle label="SMA 20" enabled={overlays.sma20} onClick={() => toggleOverlay("sma20")} />
        <OverlayToggle label="SMA 50" enabled={overlays.sma50} onClick={() => toggleOverlay("sma50")} />
        <OverlayToggle label="SMA 200" enabled={overlays.sma200} onClick={() => toggleOverlay("sma200")} />
        <OverlayToggle
          label="Bandas Bollinger"
          enabled={overlays.bollinger}
          onClick={() => toggleOverlay("bollinger")}
        />
      </div>
      <StockChartClient
        data={data}
        height={height}
        overlays={overlays}
        onVisibleRangeChange={setVisibleRange}
      />
      <RSIChart data={data} visibleRange={visibleRange} />
    </section>
  );
}

interface OverlayToggleProps {
  label: string;
  enabled: boolean;
  onClick: () => void;
}

function OverlayToggle({ label, enabled, onClick }: OverlayToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      className={`h-7 border px-2.5 text-xs font-medium transition-colors ${
        enabled
          ? "border-gain/50 bg-gain/15 text-gain-bright"
          : "border-white/10 bg-financial-card text-zinc-300 hover:border-white/25 hover:text-white"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}