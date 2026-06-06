// app/api/compare/route.ts
// Compares two individual salary records side-by-side and calculates deltas.
//
// WHY $transaction for the two findUnique calls:
//   Ensures the two salary records are read at the exact same database state
//   and avoids sequential query latency, executing both lookups in parallel.
//
// WHY Cache-Control: 'no-cache':
//   Comparison pages are highly dynamic and user-driven (comparing specific candidates).
//   Caching at the CDN level is not useful because the search space of combinations
//   (e.g., comparing candidate A vs candidate B) is virtually infinite.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const s1 = searchParams.get('s1');
  const s2 = searchParams.get('s2');

  // 1. Guard: Check for required query params
  if (!s1 || !s2) {
    return NextResponse.json(
      { error: true, message: 's1 and s2 query parameters are required' },
      { status: 400 }
    );
  }

  // 2. Guard: Prevent comparing a record to itself
  if (s1 === s2) {
    return NextResponse.json(
      { error: true, message: 's1 and s2 must be different records' },
      { status: 400 }
    );
  }

  // 3. Fetch both records atomically in parallel
  const [r1, r2] = await prisma.$transaction([
    prisma.salary.findUnique({
      where: { id: s1 },
      include: { company: true },
    }),
    prisma.salary.findUnique({
      where: { id: s2 },
      include: { company: true },
    }),
  ]);

  // 4. Guard: Check existence of both records and report exactly which is missing
  if (!r1) {
    return NextResponse.json(
      { error: true, message: 's1 not found' },
      { status: 404 }
    );
  }

  if (!r2) {
    return NextResponse.json(
      { error: true, message: 's2 not found' },
      { status: 404 }
    );
  }

  // 5. Compute numeric and monetary deltas (positive/negative)
  // BigInts are converted to Numbers to avoid serialization issues and support floats in deltas.
  const delta = {
    base_delta: Number(r1.base_salary) - Number(r2.base_salary),
    bonus_delta: Number(r1.bonus) - Number(r2.bonus),
    stock_delta: Number(r1.stock) - Number(r2.stock),
    tc_delta: Number(r1.total_compensation) - Number(r2.total_compensation),
    experience_delta: r1.experience_years - r2.experience_years,
  };

  // 6. Return payload with 'no-cache' headers
  return NextResponse.json(
    {
      record_1: r1,
      record_2: r2,
      delta,
    },
    {
      headers: {
        'Cache-Control': 'no-cache',
      },
    }
  );
}
