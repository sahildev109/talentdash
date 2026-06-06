// lib/formatters.ts
// All monetary display logic lives here and nowhere else.
// The architecture mandates salaries are stored in PAISE (smallest unit),
// so every formatter divides by 100 before display. Centralising this means
// a unit change (e.g., switching to rupees storage) requires one edit, not twenty.

import { CURRENCY_RATES } from '@/lib/constants';

/**
 * formatINR — converts a paise value to a human-readable INR string.
 * Uses lakh/crore notation (standard in India) rather than million/billion
 * because the target audience is Indian job-seekers. "₹42.0L" is instantly
 * understood; "₹4,200,000" requires mental arithmetic.
 */
export function formatINR(paise: number | bigint): string {
  const rs = Number(paise) / 100; // stored in paise → convert to rupees first

  if (rs >= 10_000_000) return `₹${(rs / 10_000_000).toFixed(2)}Cr`;
  if (rs >= 100_000) return `₹${(rs / 100_000).toFixed(1)}L`;

  // Fallback for sub-lakh amounts: use Intl for locale-correct formatting
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rs);
}

/**
 * formatUSD — converts a cents value to a human-readable USD string.
 * Stored in cents (smallest unit) to mirror paise storage for INR,
 * keeping the storage contract consistent across currencies.
 */
export function formatUSD(cents: number | bigint): string {
  const dollars = Number(cents) / 100; // stored in cents → convert to dollars

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(dollars);
}

/**
 * formatSalary — the single public API for formatting any salary amount.
 * Returns "-" for zero amounts so UI columns show an em-dash rather than
 * "₹0" — which would be misleading (zero means "not reported", not "no pay").
 * Conversion rates are applied at display time; the DB value is always original currency.
 */
export function formatSalary(
  amount: bigint,
  currency: string,
  displayCurrency: string
): string {
  // Zero means the field was not submitted — render em-dash, never ₹0 or $0
  if (amount === 0n) return '-';

  // Cross-currency display: convert on the fly using config-driven rates
  if (displayCurrency === 'USD' && currency === 'INR')
    return formatUSD(Math.round(Number(amount) * CURRENCY_RATES.INR_TO_USD));

  if (displayCurrency === 'INR' && currency === 'USD')
    return formatINR(Math.round(Number(amount) * CURRENCY_RATES.USD_TO_INR));

  // Same-currency display: format directly without conversion
  return currency === 'INR' ? formatINR(amount) : formatUSD(amount);
}
