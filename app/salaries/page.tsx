import { prisma } from '@/lib/db';
import SalaryTable from '@/components/features/SalaryTable';
import FilterBar from '@/components/features/FilterBar';
import { generateSalariesMetadata } from '@/lib/metadata';
import { buildSalaryJsonLd } from '@/lib/jsonld';
import { Prisma, Level, Currency } from '@prisma/client';

export const revalidate = 3600; // ISR: rebuild at most every hour

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  
  // Convert any string[] or undefined values to standard string | undefined for metadata
  const metadataParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (typeof value === 'string') {
      metadataParams[key] = value;
    } else if (Array.isArray(value) && value.length > 0) {
      metadataParams[key] = value[0];
    }
  }
  
  return generateSalariesMetadata(metadataParams);
}

export default async function SalariesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  // 1. Pagination parameters (defaults: page=1, limit=25)
  const page = Math.max(1, parseInt(String(resolvedSearchParams.page ?? '1')));
  const limit = 25;
  const skip = (page - 1) * limit;

  // 2. Build where filter clause dynamically
  const where: Prisma.SalaryWhereInput = {};

  const levelParam = resolvedSearchParams.level;
  if (typeof levelParam === 'string' && levelParam) {
    where.level = levelParam as Level;
  }

  const currencyParam = resolvedSearchParams.currency;
  if (typeof currencyParam === 'string' && currencyParam) {
    where.currency = currencyParam as Currency;
  }

  const locationParam = resolvedSearchParams.location;
  if (typeof locationParam === 'string' && locationParam) {
    where.location = { contains: locationParam, mode: 'insensitive' };
  }

  const roleParam = resolvedSearchParams.role;
  if (typeof roleParam === 'string' && roleParam) {
    where.role = { contains: roleParam, mode: 'insensitive' };
  }

  const companyParam = resolvedSearchParams.company;
  if (typeof companyParam === 'string' && companyParam) {
    where.company = { name: { contains: companyParam, mode: 'insensitive' } };
  }

  // 3. Sorting parameter
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'total_comp_desc';
  let orderBy: Prisma.SalaryOrderByWithRelationInput = { total_compensation: 'desc' };

  if (sort === 'total_comp_asc') {
    orderBy = { total_compensation: 'asc' };
  } else if (sort === 'newest') {
    orderBy = { submitted_at: 'desc' };
  } else if (sort === 'date_desc') {
    orderBy = { submitted_at: 'desc' };
  }

  // 4. Query DB inside transactional boundary for atomic pagination
  const [salaries, total] = await prisma.$transaction([
    prisma.salary.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { company: true },
    }),
    prisma.salary.count({ where }),
  ]);

  const h1Text = 'Salary Data Database';

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#222222] mb-3">
        Salary <span className="text-[#FF385C]">Database</span>
      </h1>
      <p className="text-lg text-gray-500 font-medium mb-8 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        {total.toLocaleString()} verified salary records
      </p>

      <FilterBar />

      <SalaryTable
        salaries={salaries}
        meta={{ total, page, limit, totalPages: Math.ceil(total / limit) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildSalaryJsonLd(salaries, h1Text)),
        }}
      />
    </main>
  );
}
