import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSafe(value: number | string | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null) return "0.00";
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? "0.00" : num.toFixed(decimals);
}
