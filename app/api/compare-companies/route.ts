import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function getMedian(numbers: number[]) {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function getTopFreq(items: string[]) {
  if (items.length === 0) return '-';
  const counts: Record<string, number> = {};
  let max = 0;
  let top = '-';
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1;
    if (counts[item] > max) {
      max = counts[item];
      top = item;
    }
  }
  return top;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const c1 = searchParams.get('c1');
  const c2 = searchParams.get('c2');

  if (!c1 || !c2) {
    return NextResponse.json(
      { error: true, message: 'c1 and c2 query parameters are required (company slugs)' },
      { status: 400 }
    );
  }

  if (c1 === c2) {
    return NextResponse.json(
      { error: true, message: 'c1 and c2 must be different companies' },
      { status: 400 }
    );
  }

  const [company1, company2] = await prisma.$transaction([
    prisma.company.findUnique({
      where: { slug: c1 },
      include: { salaries: true },
    }),
    prisma.company.findUnique({
      where: { slug: c2 },
      include: { salaries: true },
    }),
  ]);

  if (!company1) {
    return NextResponse.json({ error: true, message: `Company ${c1} not found` }, { status: 404 });
  }

  if (!company2) {
    return NextResponse.json({ error: true, message: `Company ${c2} not found` }, { status: 404 });
  }

  const c1Stats = {
    name: company1.name,
    slug: company1.slug,
    recordCount: company1.salaries.length,
    medianBase: getMedian(company1.salaries.map(s => Number(s.base_salary))),
    medianBonus: getMedian(company1.salaries.map(s => Number(s.bonus))),
    medianStock: getMedian(company1.salaries.map(s => Number(s.stock))),
    medianTc: getMedian(company1.salaries.map(s => Number(s.total_compensation))),
    medianYoe: getMedian(company1.salaries.map(s => s.experience_years)),
    topRole: getTopFreq(company1.salaries.map(s => s.role)),
    entryTc: getMedian(company1.salaries.filter(s => s.experience_years <= 2).map(s => Number(s.total_compensation))),
    seniorTc: getMedian(company1.salaries.filter(s => s.experience_years >= 5).map(s => Number(s.total_compensation))),
  };

  const c2Stats = {
    name: company2.name,
    slug: company2.slug,
    recordCount: company2.salaries.length,
    medianBase: getMedian(company2.salaries.map(s => Number(s.base_salary))),
    medianBonus: getMedian(company2.salaries.map(s => Number(s.bonus))),
    medianStock: getMedian(company2.salaries.map(s => Number(s.stock))),
    medianTc: getMedian(company2.salaries.map(s => Number(s.total_compensation))),
    medianYoe: getMedian(company2.salaries.map(s => s.experience_years)),
    topRole: getTopFreq(company2.salaries.map(s => s.role)),
    entryTc: getMedian(company2.salaries.filter(s => s.experience_years <= 2).map(s => Number(s.total_compensation))),
    seniorTc: getMedian(company2.salaries.filter(s => s.experience_years >= 5).map(s => Number(s.total_compensation))),
  };

  const delta = {
    base_delta: c1Stats.medianBase - c2Stats.medianBase,
    bonus_delta: c1Stats.medianBonus - c2Stats.medianBonus,
    stock_delta: c1Stats.medianStock - c2Stats.medianStock,
    tc_delta: c1Stats.medianTc - c2Stats.medianTc,
    entry_tc_delta: c1Stats.entryTc - c2Stats.entryTc,
    senior_tc_delta: c1Stats.seniorTc - c2Stats.seniorTc,
    experience_delta: c1Stats.medianYoe - c2Stats.medianYoe,
  };

  return NextResponse.json(
    {
      company_1: c1Stats,
      company_2: c2Stats,
      delta,
    },
    {
      headers: {
        'Cache-Control': 'no-cache',
      },
    }
  );
}
