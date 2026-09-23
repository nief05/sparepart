export { cn } from "cn";

/**
 * Deterministic Rupiah currency formatter that eliminates SSR/hydration mismatches
 * caused by platform differences in Intl.NumberFormat non-breaking space (U+00A0).
 */
export function formatCurrency(val: number | string | null | undefined): string {
  const num = typeof val === "number" ? val : Number(val);
  if (isNaN(num)) return "Rp 0";
  const isNegative = num < 0;
  const absVal = Math.round(Math.abs(num));
  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
}
