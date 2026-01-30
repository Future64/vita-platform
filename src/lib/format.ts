/**
 * Format a number with thousand separators
 * Uses a consistent format for both server and client
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Format currency in Ѵ
 */
export function formatVita(amount: number): string {
  return `${formatNumber(amount)} Ѵ`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
