// lib/constants.ts
// Centralised constant definitions so every layer (API, UI, formatting) reads from
// a single source of truth. Changing a value here propagates everywhere — no drift.

import type { Level } from '@/types';

/**
 * LEVEL_ENUM — ordered array of all valid Level values.
 * Order matches the Prisma enum declaration so UI renders tiers in a logical
 * progression (junior → senior → staff). Also used for API enum validation
 * to avoid hardcoding string arrays in multiple route handlers.
 */
export const LEVEL_ENUM: Level[] = [
  'L3',
  'L4',
  'L5',
  'L6',
  'SDE_I',
  'SDE_II',
  'SDE_III',
  'STAFF',
  'PRINCIPAL',
  'IC4',
  'IC5',
];

/**
 * CURRENCY_RATES — conversion multipliers for cross-currency display.
 * These are approximate market rates used only for display purposes.
 * The database always stores the original currency + amount; conversions
 * are applied in formatSalary() at render time, never persisted.
 */
export const CURRENCY_RATES: Record<string, number> = {
  INR_TO_USD: 0.012,
  INR_TO_GBP: 0.0095,
  USD_TO_INR: 83.5,
};

/**
 * LEVEL_COLORS — hex color per level tier for the LevelDistribution bar.
 * Colors are intentionally tiered (grey → blue → indigo → purple → navy)
 * to give a visual hierarchy that mirrors seniority, making distribution
 * charts immediately readable without a legend.
 */
export const LEVEL_COLORS: Record<Level, string> = {
  L3: '#94A3B8',
  L4: '#3B82F6',
  L5: '#6366F1',
  L6: '#9333EA',
  SDE_I: '#64748B',
  SDE_II: '#2563EB',
  SDE_III: '#4F46E5',
  STAFF: '#7C3AED',
  PRINCIPAL: '#1E3A5F',
  IC4: '#0F766E',
  IC5: '#065F46',
};
