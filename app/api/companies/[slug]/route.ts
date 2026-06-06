// app/api/companies/[slug]/route.ts
// Retrieves company metadata, all associated salaries, and aggregate statistics.
//
// WHY true statistical median (not average):
//   Averages are heavily skewed by extreme outliers (e.g. one principal engineer
//   making 10x the entry-level salary). A median gives the true "middle" salary
//   which represents what a typical candidate can actually expect.
//
// WHY s-maxage=3600 and stale-while-revalidate=86400:
//   Company pages change very rarely. Caching for 1 hour at the CDN level and
//   allowing a 24-hour window to serve stale data while rebuilding asynchronously
//   drastically reduces database load and ensures sub-100ms response times.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  // Await params for Next.js 15 compatibility
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // 1. Fetch company with salaries ordered descending by total compensation
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      salaries: {
        orderBy: {
          total_compensation: 'desc',
        },
      },
    },
  });

  // 2. Guard: Return 404 if not found
  if (!company) {
    return NextResponse.json(
      { error: true, message: 'Company not found' },
      { status: 404 }
    );
  }

  // 3. Compute true statistical median
  // Sort ascending first to find the middle elements
  const tcs = company.salaries
    .map((s) => Number(s.total_compensation))
    .sort((a, b) => a - b);

  const mid = Math.floor(tcs.length / 2);
  const median =
    tcs.length === 0
      ? 0
      : tcs.length % 2 === 0
      ? (tcs[mid - 1] + tcs[mid]) / 2
      : tcs[mid];

  // 4. Compute level distribution counts
  const level_distribution: Record<string, number> = {};
  for (const s of company.salaries) {
    level_distribution[s.level] = (level_distribution[s.level] ?? 0) + 1;
  }

  // 5. Return payload with CDN Cache-Control headers
  return NextResponse.json(
    {
      ...company,
      median_total_compensation: median,
      level_distribution,
    },
    {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}
