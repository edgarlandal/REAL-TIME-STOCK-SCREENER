"use client";

import dynamic from "next/dynamic";
import type { CandleData } from "@/types/chart";

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
  return <StockChartClient data={data} height={height} />;
}