// types/index.ts
import type { Prisma } from '@prisma/client';

export type Level = 'L3' | 'L4' | 'L5' | 'L6' | 'SDE_I' | 'SDE_II' | 'SDE_III' | 'STAFF' | 'PRINCIPAL' | 'IC4' | 'IC5';

export type Currency = 'INR' | 'USD' | 'GBP' | 'EUR';

export type Source = 'CONTRIBUTOR' | 'SCRAPED' | 'AI_INFERRED';

export interface Company {
  id: string;
  name: string;
  slug: string;
  normalized_name: string;
  industry?: string | null;
  headquarters?: string | null;
  founded_year?: number | null;
  headcount_range?: string | null;
}

// API response shape — used for JSON serialisation boundaries
export interface Salary {
  id: string;
  company_id: string;
  company: Company;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experience_years: number;
  base_salary: bigint;
  bonus: bigint;
  stock: bigint;
  total_compensation: bigint;
  source: Source;
  confidence_score: number;
  is_verified: boolean;
  submitted_at: string;
}

// Prisma-generated type — use internally in pages/components that query the DB directly.
// confidence_score is Prisma.Decimal; submitted_at is Date — exact DB representations.
export type PrismaSalaryWithCompany = Prisma.SalaryGetPayload<{
  include: { company: true };
}>;

export interface SalaryListResponse {
  data: Salary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CompanyWithStats extends Company {
  salaries: Salary[];
  median_total_compensation: number;
  level_distribution: Record<Level, number>;
}
