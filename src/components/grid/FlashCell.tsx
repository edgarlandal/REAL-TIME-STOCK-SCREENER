"use client";

import { memo, useEffect, useRef, useState } from "react";
import { formatCurrency, type CurrencyCode } from "@/components/grid/CellRenderers";

const FLASH_DURATION_MS = 300;

export interface FlashCellProps {
  price: number;
  currency?: CurrencyCode;
  className?: string;
}

function FlashCellComponent({ price, currency = "USD", className = "" }: FlashCellProps) {
  const previousPriceRef = useRef<number | null>(null);
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    const previousPrice = previousPriceRef.current;
    previousPriceRef.current = price;

    if (previousPrice === null || previousPrice === price) {
      return;
    }

    const nextFlashClass = price > previousPrice ? "flash-green" : "flash-red";
    setFlashClass("");

    const animationFrame = window.requestAnimationFrame(() => setFlashClass(nextFlashClass));
    const timeout = window.setTimeout(() => setFlashClass(""), FLASH_DURATION_MS);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(timeout);
    };
  }, [price]);

  return <span className={`tabular-nums ${flashClass} ${className}`.trim()}>{formatCurrency(price, currency)}</span>;
}

export function areFlashCellPropsEqual(previous: FlashCellProps, next: FlashCellProps): boolean {
  return (
    previous.price === next.price &&
    previous.currency === next.currency &&
    previous.className === next.className
  );
}

export const FlashCell = memo(FlashCellComponent, areFlashCellPropsEqual);