"use client";

import { useEffect, useRef } from "react";
import { BarChart3, Copy, Filter, Star } from "lucide-react";
import type { Stock } from "@/types/stock";

export interface ContextMenuPosition {
  x: number;
  y: number;
}

interface ContextMenuProps {
  stock: Stock;
  position: ContextMenuPosition;
  onClose: () => void;
  onOpenChart?: (stock: Stock) => void;
  onToggleWatchlist?: (stock: Stock) => void;
  onFilterSector?: (sector: string) => void;
}

export function ContextMenu({
  stock,
  position,
  onClose,
  onOpenChart,
  onToggleWatchlist,
  onFilterSector,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function runAction(action: () => void): void {
    action();
    onClose();
  }

  function copySymbol(): void {
    if (navigator.clipboard !== undefined) {
      void navigator.clipboard.writeText(stock.symbol).catch(() => undefined);
    }
  }

  const left = Math.min(position.x, window.innerWidth - 220);
  const top = Math.min(position.y, window.innerHeight - 180);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={`Actions for ${stock.symbol}`}
      className="fixed z-50 w-52 border border-white/10 bg-financial-card p-1 shadow-xl shadow-black/40"
      style={{ left: Math.max(left, 8), top: Math.max(top, 8) }}
    >
      <div className="border-b border-white/10 px-2 py-1.5 text-xs font-medium text-zinc-400">
        {stock.symbol}
      </div>
      <MenuItem icon={<BarChart3 />} onClick={() => runAction(() => onOpenChart?.(stock))}>
        Ver Gráfico
      </MenuItem>
      <MenuItem icon={<Star />} onClick={() => runAction(() => onToggleWatchlist?.(stock))}>
        Añadir a Watchlist
      </MenuItem>
      <MenuItem icon={<Copy />} onClick={() => runAction(copySymbol)}>
        Copiar Símbolo
      </MenuItem>
      <MenuItem icon={<Filter />} onClick={() => runAction(() => onFilterSector?.(stock.sector))}>
        Filtrar por Sector
      </MenuItem>
    </div>
  );
}

interface MenuItemProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}

function MenuItem({ children, icon, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className="flex h-8 w-full items-center gap-2 px-2 text-left text-sm text-zinc-200 hover:bg-white/10 hover:text-white"
      onClick={onClick}
    >
      <span aria-hidden="true" className="text-zinc-400 [&>svg]:size-4">
        {icon}
      </span>
      {children}
    </button>
  );
}