import type { FuelType, Phase, StockStatus } from "../types";

export const FUEL_LABELS: Record<FuelType, string> = {
  diesel: "Diesel",
  gas: "Gas",
  petrol: "Petrol",
};
export const PHASE_LABELS: Record<Phase, string> = {
  single: "Single Phase",
  three: "Three Phase",
};
export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: "In Stock",
  low: "Low Stock",
  out: "Out of Stock",
};
export const STOCK_STATUS_COLORS: Record<StockStatus, string> = {
  in_stock: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  low: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  out: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const FUEL_TYPES = Object.keys(FUEL_LABELS) as FuelType[];
export const PHASES = Object.keys(PHASE_LABELS) as Phase[];
