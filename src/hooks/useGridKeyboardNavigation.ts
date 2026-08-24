"use client";

import { useState, type KeyboardEvent, type RefObject } from "react";
import type { Stock } from "@/types/stock";

export interface GridKeyboardNavigationOptions {
  rows: Stock[];
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onOpenChart?: (stock: Stock) => void;
  onToggleWatchlist?: (stock: Stock) => void;
}

export interface GridKeyboardNavigationResult {
  selectedRowIndex: number;
  selectedStock: Stock | undefined;
  setSelectedRowIndex: (index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA";
}

export function useGridKeyboardNavigation({
  rows,
  searchInputRef,
  onOpenChart,
  onToggleWatchlist,
}: GridKeyboardNavigationOptions): GridKeyboardNavigationResult {
  const [selectedRowIndexState, setSelectedRowIndex] = useState(0);
  const selectedRowIndex = Math.min(selectedRowIndexState, Math.max(rows.length - 1, 0));
  const selectedStock = rows[selectedRowIndex];

  function selectRow(index: number): void {
    if (rows.length === 0) {
      setSelectedRowIndex(0);
      return;
    }

    setSelectedRowIndex(Math.min(Math.max(index, 0), rows.length - 1));
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (isEditableElement(event.target)) {
      return;
    }

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        selectRow(selectedRowIndex - 1);
        return;
      case "ArrowDown":
        event.preventDefault();
        selectRow(selectedRowIndex + 1);
        return;
      case "Home":
        event.preventDefault();
        selectRow(0);
        return;
      case "End":
        event.preventDefault();
        selectRow(rows.length - 1);
        return;
      case "Enter":
        if (selectedStock !== undefined) {
          event.preventDefault();
          onOpenChart?.(selectedStock);
        }
        return;
      case " ":
      case "Spacebar":
        if (selectedStock !== undefined) {
          event.preventDefault();
          onToggleWatchlist?.(selectedStock);
        }
        return;
      case "/":
        if (searchInputRef?.current !== null && searchInputRef?.current !== undefined) {
          event.preventDefault();
          searchInputRef.current.focus();
        }
        return;
    }
  }

  return {
    selectedRowIndex,
    selectedStock,
    setSelectedRowIndex: selectRow,
    onKeyDown,
  };
}