"use client";

/* eslint-disable react-hooks/incompatible-library */

import { useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { stockColumns } from "@/components/grid/columns";
import { ContextMenu, type ContextMenuPosition } from "@/components/grid/ContextMenu";
import type { Stock } from "@/types/stock";

export const GRID_ROW_HEIGHT = 36;
export const GRID_OVERSCAN_ROWS = 15;

interface DataGridProps {
  data: Stock[];
  columns?: ColumnDef<Stock>[];
  height?: number;
  onOpenChart?: (stock: Stock) => void;
  onToggleWatchlist?: (stock: Stock) => void;
  onFilterSector?: (sector: string) => void;
}

export function DataGrid({
  data,
  columns = stockColumns,
  height = 600,
  onOpenChart,
  onToggleWatchlist,
  onFilterSector,
}: DataGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [contextMenu, setContextMenu] = useState<{
    stock: Stock;
    position: ContextMenuPosition;
  } | null>(null);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const gridTemplateColumns = `repeat(${visibleColumns.length}, minmax(9rem, 1fr))`;
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => GRID_ROW_HEIGHT,
    overscan: GRID_OVERSCAN_ROWS,
  });

  return (
    <div
      ref={scrollContainerRef}
      className="data-grid relative w-full overflow-auto border border-white/10 bg-financial-card"
      style={{ height, minHeight: height }}
    >
      <table className="grid min-w-max w-full border-collapse text-sm text-zinc-100">
        <thead className="sticky top-0 z-10 grid border-b border-white/10 bg-financial-card shadow-[0_1px_0_rgba(255,255,255,0.08)]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="grid h-9 items-center"
              style={{ gridTemplateColumns }}
            >
              {headerGroup.headers.map((header, index) => (
                <th
                  key={header.id}
                  className={`overflow-hidden px-3 text-left align-middle${
                    index === 0 ? " data-grid-pinned-header" : ""
                  }`}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          className="relative grid"
          style={{ height: rowVirtualizer.getTotalSize() }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];

            return (
              <tr
                key={row.id}
                aria-rowindex={virtualRow.index + 2}
                className="absolute grid h-9 w-full items-center border-b border-white/5 bg-financial-card hover:bg-white/5"
                onContextMenu={(event) => {
                  event.preventDefault();
                  setContextMenu({
                    stock: row.original,
                    position: { x: event.clientX, y: event.clientY },
                  });
                }}
                style={{
                  gridTemplateColumns,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell, index) => (
                  <td
                    key={cell.id}
                    className={`overflow-hidden px-3 whitespace-nowrap text-ellipsis${
                      index === 0 ? " data-grid-pinned-cell" : ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {contextMenu !== null ? (
        <ContextMenu
          stock={contextMenu.stock}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onOpenChart={onOpenChart}
          onToggleWatchlist={onToggleWatchlist}
          onFilterSector={onFilterSector}
        />
      ) : null}
    </div>
  );
}