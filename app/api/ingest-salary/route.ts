// app/api/ingest-salary/route.ts
//
// The single write gateway for all salary data. Every record in the DB passed
// through this endpoint. Its job is: validate strictly → normalise company →
// strip and recompute total_compensation → deduplicate → persist.
//
// WHY strict sequential validation (stop at first failure):
//   Returning all errors at once feels friendlier but makes the pipeline harder
//   to reason about — later steps depend on earlier ones being clean. Stopping
//   at the first failure keeps error surfaces small and predictable, and matches
//   the architecture doc's explicit requirement.

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { normaliseCompany } from '@/lib/normalise';
import { LEVEL_ENUM } from '@/lib/constants';

// --------------------------------------------------------------------------
// Valid enum value sets — derived from constants/types so they stay in sync
// with the Prisma schema without manual duplication.
// --------------------------------------------------------------------------

const VALID_LEVELS = LEVEL_ENUM; // ['L3', 'L4', ..., 'IC5']

const VALID_CURRENCIES = ['INR', 'USD', 'GBP', 'EUR'] as const;
type ValidCurrency = (typeof VALID_CURRENCIES)[number];

const VALID_SOURCES = ['CONTRIBUTOR', 'SCRAPED', 'AI_INFERRED'] as const;
type ValidSource = (typeof VALID_SOURCES)[number];

// --------------------------------------------------------------------------
// Helper — builds a consistent 400 error shape.
// All error responses share the same envelope so clients can handle them
// generically: if (body.error) showFieldError(body.field, body.message).
// --------------------------------------------------------------------------

function err400(message: string, field?: string) {
  return NextResponse.json(
    { error: true, ...(field ? { field } : {}), message },
    { status: 400 }
  );
}

// --------------------------------------------------------------------------
// POST /api/ingest-salary
// --------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return err400('Request body must be valid JSON');
  }

  // ─── Step 1: Required field presence ────────────────────────────────────
  //
  // WHY check presence before type: avoids confusing downstream errors
  // ("Cannot convert undefined to BigInt") when a caller simply forgot a field.
  // Presence is checked in the order a reviewer would fill out a form.

  const REQUIRED = [
    'company',
    'role',
    'level',
    'location',
    'currency',
    'experience_years',
    'base_salary',
    'source',
    'confidence_score',
  ] as const;

  for (const field of REQUIRED) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return err400(`${field} is required`, field);
    }
  }

  // ─── Step 2: Enum validation ─────────────────────────────────────────────
  //
  // WHY validate enums before numerics: free-text level values ("Senior Engineer")
  // would pass numeric checks but create invalid DB rows. Rejecting them here,
  // before any DB call, keeps constraint enforcement in application code where
  // it can return a descriptive error — the DB would just throw an opaque 500.

  const level = body.level as string;
  if (!(VALID_LEVELS as readonly string[]).includes(level)) {
    return err400(
      `Level must be one of: ${VALID_LEVELS.join(', ')}`,
      'level'
    );
  }

  const currency = body.currency as string;
  if (!(VALID_CURRENCIES as readonly string[]).includes(currency)) {
    return err400(
      `Currency must be one of: ${VALID_CURRENCIES.join(', ')}`,
      'currency'
    );
  }

  const source = body.source as string;
  if (!(VALID_SOURCES as readonly string[]).includes(source)) {
    return err400(
      `Source must be one of: ${VALID_SOURCES.join(', ')}`,
      'source'
    );
  }

  // ─── Step 3: experience_years — integer, > 0, < 51 ──────────────────────
  //
  // WHY < 51 (not ≤ 50): the architecture doc specifies exclusive upper bound.
  // The range guard prevents obviously bogus inputs ("99 years experience")
  // that would skew aggregate statistics for a level.

  const exp = Number(body.experience_years);
  if (!Number.isInteger(exp) || exp <= 0 || exp >= 51) {
    return err400(
      'experience_years must be an integer greater than 0 and less than 51',
      'experience_years'
    );
  }

  // ─── Step 4: base_salary > 0 ────────────────────────────────────────────
  //
  // WHY convert via BigInt(Math.round(Number(x))): clients may send floats
  // (e.g. 1500000.5) which BigInt() alone cannot parse. Rounding to the
  // nearest paise/cent before conversion preserves precision without errors.

  let base: bigint;
  try {
    base = BigInt(Math.round(Number(body.base_salary)));
  } catch {
    return err400('base_salary must be a valid number', 'base_salary');
  }

  if (base <= 0n) {
    return err400('base_salary must be greater than 0', 'base_salary');
  }

  // ─── Step 5: confidence_score — between 0.0 and 1.0 ────────────────────
  //
  // WHY a float range check here rather than a DB constraint: Decimal(4,3) in
  // Postgres would accept 1.000 but reject 1.001 with a generic DB error.
  // Validating here returns a meaningful message and prevents a round-trip.

  const cs = Number(body.confidence_score);
  if (Number.isNaN(cs) || cs < 0 || cs > 1) {
    return err400(
      'confidence_score must be a number between 0.0 and 1.0',
      'confidence_score'
    );
  }

  // ─── Step 6: Normalise company → upsert ─────────────────────────────────
  //
  // WHY upsert instead of findOrCreate: upsert is atomic — no race condition
  // between two concurrent ingests for the same new company. The update clause
  // is intentionally empty so existing company metadata is never overwritten
  // by a submission that may have less-complete data than the canonical record.

  const normalised = normaliseCompany(String(body.company));

  const company = await prisma.company.upsert({
    where: { normalized_name: normalised },
    create: {
      name: String(body.company).trim(),
      slug: normalised,
      normalized_name: normalised,
    },
    update: {}, // never overwrite existing canonical company record
  });

  // ─── Step 7: Recompute total_compensation — strip client value ───────────
  //
  // WHY always recompute server-side: this is the single most important data
  // integrity rule in the architecture. A client that submits total_compensation
  // directly could manipulate aggregate rankings. Server recomputation makes
  // the formula (base + bonus + stock) a hard invariant, not a convention.

  let bonus: bigint;
  let stock: bigint;

  try {
    bonus = BigInt(Math.round(Number(body.bonus ?? 0)));
    stock = BigInt(Math.round(Number(body.stock ?? 0)));
  } catch {
    return err400('bonus and stock must be valid numbers');
  }

  const totalCompensation = base + bonus + stock;

  // ─── Step 8: Deduplication ───────────────────────────────────────────────
  //
  // WHY ±10% base_salary window: exact deduplication would miss the same
  // submission with a minor rounding difference (e.g. lakh vs exact paise).
  // 10% is tight enough to catch accidental duplicates while allowing
  // genuine salary changes within the same window.
  //
  // WHY 48-hour window: short enough that the same user cannot re-submit
  // the same record twice in a session, but long enough to catch retry loops
  // from automated scrapers that run daily.

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const tenPct = base / 10n; // BigInt arithmetic — no floating-point rounding

  const duplicate = await prisma.salary.findFirst({
    where: {
      company_id: company.id,
      role: String(body.role),
      level: level as (typeof VALID_LEVELS)[number],
      location: String(body.location),
      submitted_at: { gte: cutoff },
      base_salary: {
        gte: base - tenPct,
        lte: base + tenPct,
      },
    },
  });

  if (duplicate) {
    return NextResponse.json(
      {
        error: true,
        message: 'Duplicate record detected within 48 hours',
      },
      { status: 409 }
    );
  }

  // ─── Step 9: Persist and trigger ISR revalidation ───────────────────────
  //
  // WHY revalidatePath after write: the architecture is SSG/ISR — the salary
  // table and company pages are pre-built. Without revalidation, a new record
  // would not appear on the site until the next scheduled rebuild. Calling
  // revalidatePath() marks the affected pages for rebuild on next request,
  // keeping data fresh without a full redeploy.

  const record = await prisma.salary.create({
    data: {
      company_id: company.id,
      role: String(body.role),
      level: level as (typeof VALID_LEVELS)[number],
      location: String(body.location),
      currency: currency as ValidCurrency,
      experience_years: exp,
      base_salary: base,
      bonus,
      stock,
      total_compensation: totalCompensation,
      source: source as ValidSource,
      confidence_score: cs,
      is_verified: false,
    },
    include: { company: true },
  });

  // Trigger ISR rebuild for the affected pages
  revalidatePath('/salaries');
  revalidatePath(`/companies/${company.slug}`);

  return NextResponse.json(record, { status: 201 });
}
