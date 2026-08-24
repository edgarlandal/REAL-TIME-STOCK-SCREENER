"use client";

import dynamic from "next/dynamic";
import type { CandleData } from "@/types/chart";
import type { ChartLogicalRange } from "./StockChart";

interface RSIChartProps {
  data: CandleData[];
  height?: number;
  visibleRange: ChartLogicalRange | null;
}

const RSIChartClient = dynamic(
  () => import("./RSIChartClient").then((module) => module.RSIChartClient),
  {
    ssr: false,
    loading: () => <div aria-label="Cargando RSI" className="mt-2 w-full border border-white/10 bg-financial-card" style={{ height: 180 }} />,
  },
);

export function RSIChart({ data, height = 180, visibleRange }: RSIChartProps) {
  return <RSIChartClient data={data} height={height} visibleRange={visibleRange} />;
}