// lib/normalise.ts
// Company name normalisation is the single most critical data quality gate.
// If "Google" and "Google India" resolve to different Company records, every
// aggregate (median TC, level distribution, company page) is silently wrong.
// This two-layer approach handles both mechanical variants (Layer 1: rules)
// and semantic variants (Layer 2: alias table) that rules alone cannot catch.

import aliases from './aliases.json';

/**
 * LEGAL_SUFFIXES — ordered longest-to-shortest.
 * Order is critical: "private limited" must be checked before "limited",
 * otherwise "pvt limited" would strip "limited" first and leave "pvt" behind,
 * producing a wrong normalised name that fails the alias lookup.
 */
const LEGAL_SUFFIXES = [
  'private limited', // must come before "limited"
  'pvt ltd',         // must come before "ltd"
  'pvt',
  'limited',
  'ltd',
  'corporation',
  'corp',
  'incorporated',
  'inc',
  'llc',
  'bpo',             // must come before shorter words it starts with
  'technologies',    // must come before "technology"
  'technology',
  'solutions',
  'services',
  'international',   // must come before "national" if ever needed
  'global',
  'india',
  'co',
  '.com',
];

/**
 * normaliseCompany — the primary data integrity gate for all ingest paths.
 *
 * WHY this exists: free-text company name input produces hundreds of variants
 * for the same company ("Google India Pvt. Ltd.", "GOOGLE", "google ").
 * Without normalisation, each variant creates a separate Company record and
 * all aggregates for that company are split across orphaned rows.
 *
 * Layer 1 (programmatic rules): handles mechanical variance — casing, whitespace,
 * punctuation, legal suffixes, TLD suffixes. Deterministic and O(n) in suffixes.
 *
 * Layer 2 (alias lookup): handles semantic variance that rules cannot resolve —
 * "Tata Consultancy Services" → "tcs", "Facebook" → "meta". The alias table
 * is a data file (aliases.json) so it can be updated without code changes.
 */
export function normaliseCompany(raw: string): string {
  // --- Layer 1: Programmatic rules ---

  let s = raw.toLowerCase().trim();

  // Strip punctuation characters that appear in company names but carry no meaning
  s = s.replace(/[.,\/\\&'"` ]+/g, ' ');

  // Collapse any runs of whitespace created by stripping punctuation
  s = s.replace(/\s+/g, ' ').trim();

  // Strip legal suffixes in longest-first order.
  // A single pass may not be enough (e.g. "pvt ltd" → strip "pvt ltd" in one go),
  // but iterating until stable handles chained suffixes like "pvt limited india".
  let prev = '';
  while (prev !== s) {
    prev = s;
    for (const suffix of LEGAL_SUFFIXES) {
      if (s.endsWith(' ' + suffix)) {
        s = s.slice(0, -(suffix.length + 1)).trim();
        break; // restart the while loop with the now-shorter string
      }
    }
  }

  // Strip country/product TLDs: "amazon.com" → "amazon", "razorpay.in" → "razorpay"
  s = s.replace(/\.(?:com|in|co\.in|io|net|org)$/, '');

  // --- Layer 2: Alias lookup ---
  // Handles semantic variants that rules cannot resolve.
  // Falls back to the rule-normalised string if no alias exists.
  return (aliases as Record<string, string>)[s] ?? s;
}
