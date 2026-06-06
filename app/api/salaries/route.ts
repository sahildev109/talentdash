// app/api/salaries/route.ts
// Handles paginated salary list fetching with filtering and sorting.
//
// WHY $transaction for count and findMany:
//   Doing two separate queries is non-atomic and prone to inconsistencies if
//   writes occur between reads. A transaction ensures page numbers and total
//   count are exactly synchronized in the returned metadata.
//
// WHY limit cap at 100:
//   Prevents denial-of-service/out-of-memory errors where a client asks for
//   unbounded rows (e.g. limit=100000). Capping it guarantees bounded database
//   memory consumption per request.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma, Level, Currency } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // 1. Pagination parameters (defaults: page=1, limit=25)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '25')));
  const skip = (page - 1) * limit;

  // 2. Build where filter clause dynamically
  const where: Prisma.SalaryWhereInput = {};

  const levelParam = searchParams.get('level');
  if (levelParam) {
    where.level = levelParam as Level;
  }

  const currencyParam = searchParams.get('currency');
  if (currencyParam) {
    where.currency = currencyParam as Currency;
  }

  const locationParam = searchParams.get('location');
  if (locationParam) {
    where.location = { contains: locationParam, mode: 'insensitive' };
  }

  const roleParam = searchParams.get('role');
  if (roleParam) {
    where.role = { contains: roleParam, mode: 'insensitive' };
  }

  const companyParam = searchParams.get('company');
  if (companyParam) {
    where.company = { name: { contains: companyParam, mode: 'insensitive' } };
  }

  // 3. Sorting parameter
  const sort = searchParams.get('sort') ?? 'total_comp_desc';
  let orderBy: Prisma.SalaryOrderByWithRelationInput = { total_compensation: 'desc' };

  if (sort === 'total_comp_asc') {
    orderBy = { total_compensation: 'asc' };
  } else if (sort === 'date_desc') {
    orderBy = { submitted_at: 'desc' };
  }

  // 4. Query DB inside transactional boundary for atomic pagination
  const [data, total] = await prisma.$transaction([
    prisma.salary.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { company: true },
    }),
    prisma.salary.count({ where }),
  ]);

  // 5. Return JSON with pagination metadata and CDN Cache-Control headers
  return NextResponse.json(
    {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
    {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=3600',
      },
    }
  );
}
