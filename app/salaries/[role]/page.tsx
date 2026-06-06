import { prisma } from '@/lib/db';
import SalaryTable from '@/components/features/SalaryTable';
import FilterBar from '@/components/features/FilterBar';
import { generateSalaryPageMetadata } from '@/lib/metadata';
import { buildSalaryJsonLd } from '@/lib/jsonld';
import { Prisma, Level, Currency } from '@prisma/client';

export const revalidate = 3600; // ISR: rebuild at most every hour
export const dynamicParams = true; // serve on-demand if not pre-built at build time

interface RolePageProps {
  params: Promise<{ role: string }> | { role: string };
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

/**
 * generateStaticParams
 * Queries distinct roles from Neon DB at build time.
 */
export async function generateStaticParams() {
  try {
    const distinctRoles = await prisma.salary.findMany({ select: { role: true }, distinct: ['role'] });
    return distinctRoles.map((s) => ({ role: s.role.toLowerCase().replace(/ /g, '-') }));
  } catch {
    // DB unreachable at build time — fall back to empty; dynamicParams=true serves on-demand
    return [];
  }
}

/**
 * getRoleNameFromSlug
 * Maps dynamic URL slug back to the exact role casing stored in the database.
 */
async function getRoleNameFromSlug(slug: string): Promise<string> {
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  
  const distinctRoles = await prisma.salary.findMany({
    select: { role: true },
    distinct: ['role'],
  });

  const match = distinctRoles.find(
    (s) => s.role.toLowerCase().replace(/ /g, '-') === decodedSlug
  );

  return match ? match.role : decodedSlug;
}

export async function generateMetadata({ params, searchParams }: RolePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const roleName = await getRoleNameFromSlug(resolvedParams.role);

  // Convert searchParams to simple types for metadata helper
  const company = typeof resolvedSearchParams.company === 'string' ? resolvedSearchParams.company : undefined;
  const location = typeof resolvedSearchParams.location === 'string' ? resolvedSearchParams.location : undefined;

  return generateSalaryPageMetadata(roleName, company, location);
}

export default async function RoleSalariesPage({ params, searchParams }: RolePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const roleName = await getRoleNameFromSlug(resolvedParams.role);

  // 1. Pagination parameters (defaults: page=1, limit=25)
  const page = Math.max(1, parseInt(String(resolvedSearchParams.page ?? '1')));
  const limit = 25;
  const skip = (page - 1) * limit;

  // 2. Build where filter clause dynamically (forced role filter matching page param)
  const where: Prisma.SalaryWhereInput = {
    role: { equals: roleName, mode: 'insensitive' },
  };

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

  const companyParam = resolvedSearchParams.company;
  if (typeof companyParam === 'string' && companyParam) {
    where.company = { name: { contains: companyParam, mode: 'insensitive' } };
  }

  // 3. Sorting parameter
  const sort = resolvedSearchParams.sort;
  const sortStr = typeof sort === 'string' ? sort : 'total_comp_desc';
  let orderBy: Prisma.SalaryOrderByWithRelationInput = { total_compensation: 'desc' };

  if (sortStr === 'total_comp_asc') {
    orderBy = { total_compensation: 'asc' };
  } else if (sortStr === 'newest') {
    orderBy = { submitted_at: 'desc' };
  } else if (sortStr === 'date_desc') {
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

  const h1Text = `${roleName} Salaries India`;

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-[#222222] mb-2">
        {h1Text}
      </h1>
      <p className="text-[#717171] mb-6">{total.toLocaleString()} salary records</p>

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
