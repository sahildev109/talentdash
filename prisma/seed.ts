import { prisma } from '../lib/db';
import { normaliseCompany } from '../lib/normalise';
import type { Company } from '@prisma/client';

async function upsertCompany(rawName: string, meta: Partial<Omit<Company, 'id' | 'slug' | 'normalized_name' | 'created_at' | 'updated_at' | 'salaries'>> = {}) {
  const normalised = normaliseCompany(rawName);
  return prisma.company.upsert({
    where: { normalized_name: normalised },
    create: { name: rawName.trim(), slug: normalised, normalized_name: normalised, ...meta },
    update: {},
  });
}

async function main() {
  // ── Normalisation edge cases ──────────────────────────────────────────────
  const g1 = await upsertCompany('Google India', { industry: 'Technology', headquarters: 'Bengaluru' });
  const g2 = await upsertCompany('GOOGLE', {});
  const g3 = await upsertCompany('google ', {});
  console.assert(g1.id === g2.id && g2.id === g3.id, 'Normalisation FAILED: Google variants');

  const t1 = await upsertCompany('Tata Consultancy Services', { industry: 'IT Services', headquarters: 'Mumbai' });
  const t2 = await upsertCompany('TCS Ltd.', {});
  console.assert(t1.id === t2.id, 'Normalisation FAILED: TCS alias');

  // ── Remaining companies ───────────────────────────────────────────────────
  const amazon   = await upsertCompany('amazon.com',                  { industry: 'E-Commerce',  headquarters: 'Bengaluru' });
  const meta     = await upsertCompany('meta platforms',              { industry: 'Technology',  headquarters: 'San Francisco' });
  const msft     = await upsertCompany('Microsoft',                   { industry: 'Technology',  headquarters: 'Hyderabad' });
  const flipkart = await upsertCompany('Flipkart Internet Pvt Ltd',   { industry: 'E-Commerce',  headquarters: 'Bengaluru' });
  const meesho   = await upsertCompany('Meesho',                      { industry: 'E-Commerce',  headquarters: 'Bengaluru' });
  const infosys  = await upsertCompany('Infosys BPO',                 { industry: 'IT Services', headquarters: 'Bengaluru' });
  const razor    = await upsertCompany('Razorpay Software',           { industry: 'Fintech',     headquarters: 'Bengaluru' });
  const zepto    = await upsertCompany('Zepto',                       { industry: 'Quick Commerce', headquarters: 'Mumbai' });
  const nvidia   = await upsertCompany('NVIDIA',                      { industry: 'Semiconductors', headquarters: 'Bengaluru' });
  const wipro    = await upsertCompany('Wipro Technologies',          { industry: 'IT Services', headquarters: 'Pune' });

  // ── Salary records ────────────────────────────────────────────────────────
  // Conversion: LPA × 1_00_000 = rupees; rupees × 100 = paise
  // e.g. ₹15L = 15_00_000 rupees = 15_00_000_00 paise

  const google = g1;
  const tcs    = t1;

  await prisma.salary.createMany({ data: [

    // ── Google (L3–STAFF, Bengaluru/Hyderabad/San Francisco, INR+USD) ───────
    // Edge: bonus=0 stock=0, TC = base exactly
    { company_id: google.id, role: 'Software Engineer', level: 'L3', location: 'Bengaluru',    currency: 'INR', experience_years: 2,  base_salary: 15_00_000_00n, bonus: 0n,          stock: 0n,            total_compensation: 15_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.95, is_verified: true  },
    { company_id: google.id, role: 'Software Engineer', level: 'L4', location: 'Bengaluru',    currency: 'INR', experience_years: 4,  base_salary: 28_00_000_00n, bonus: 3_00_000_00n, stock: 5_00_000_00n,  total_compensation: 36_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.92, is_verified: true  },
    { company_id: google.id, role: 'Senior SWE',        level: 'L5', location: 'Bengaluru',    currency: 'INR', experience_years: 7,  base_salary: 45_00_000_00n, bonus: 8_00_000_00n, stock: 20_00_000_00n, total_compensation: 73_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.90, is_verified: true  },
    // Edge: ₹1Cr+ stock — tests crore formatting
    { company_id: google.id, role: 'Staff Engineer',    level: 'L6', location: 'Hyderabad',    currency: 'INR', experience_years: 11, base_salary: 60_00_000_00n, bonus: 15_00_000_00n,stock: 1_00_00_000_00n,total_compensation: 1_75_00_000_00n,source: 'CONTRIBUTOR', confidence_score: 0.88, is_verified: true  },
    { company_id: google.id, role: 'Staff Engineer',    level: 'STAFF', location: 'Hyderabad', currency: 'INR', experience_years: 13, base_salary: 70_00_000_00n, bonus: 18_00_000_00n,stock: 80_00_000_00n, total_compensation: 1_68_00_000_00n,source: 'CONTRIBUTOR', confidence_score: 0.87, is_verified: true  },
    { company_id: google.id, role: 'Software Engineer', level: 'L5', location: 'San Francisco', currency: 'USD', experience_years: 6, base_salary: 22_000_000n,   bonus: 4_000_000n,   stock: 10_000_000n,   total_compensation: 36_000_000n,   source: 'CONTRIBUTOR', confidence_score: 0.93, is_verified: true  },

    // ── Amazon (SDE_I–PRINCIPAL, Bengaluru/Mumbai, INR) ──────────────────────
    // Edge: experience_years = 1
    { company_id: amazon.id, role: 'Software Dev Engineer', level: 'SDE_I',     location: 'Bengaluru', currency: 'INR', experience_years: 1,  base_salary: 18_00_000_00n, bonus: 2_00_000_00n, stock: 3_00_000_00n,  total_compensation: 23_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.90, is_verified: true  },
    { company_id: amazon.id, role: 'Software Dev Engineer', level: 'SDE_II',    location: 'Bengaluru', currency: 'INR', experience_years: 4,  base_salary: 32_00_000_00n, bonus: 5_00_000_00n, stock: 10_00_000_00n, total_compensation: 47_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.91, is_verified: true  },
    { company_id: amazon.id, role: 'Software Dev Engineer', level: 'SDE_III',   location: 'Bengaluru', currency: 'INR', experience_years: 8,  base_salary: 55_00_000_00n, bonus: 10_00_000_00n,stock: 25_00_000_00n, total_compensation: 90_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.89, is_verified: true  },
    { company_id: amazon.id, role: 'Principal Engineer',    level: 'PRINCIPAL', location: 'Mumbai',    currency: 'INR', experience_years: 15, base_salary: 80_00_000_00n, bonus: 20_00_000_00n,stock: 60_00_000_00n, total_compensation: 1_60_00_000_00n,source: 'CONTRIBUTOR', confidence_score: 0.85, is_verified: true  },

    // ── Meta (L4–L6, San Francisco/London, USD+GBP) ─────────────────────────
    { company_id: meta.id, role: 'Software Engineer', level: 'L4', location: 'San Francisco', currency: 'USD', experience_years: 3,  base_salary: 18_000_000n,   bonus: 3_000_000n,   stock: 8_000_000n,    total_compensation: 29_000_000n,   source: 'CONTRIBUTOR', confidence_score: 0.92, is_verified: true  },
    { company_id: meta.id, role: 'Software Engineer', level: 'L5', location: 'San Francisco', currency: 'USD', experience_years: 6,  base_salary: 26_000_000n,   bonus: 6_000_000n,   stock: 18_000_000n,   total_compensation: 50_000_000n,   source: 'CONTRIBUTOR', confidence_score: 0.90, is_verified: true  },
    { company_id: meta.id, role: 'Staff Engineer',    level: 'L6', location: 'London',        currency: 'GBP', experience_years: 10, base_salary: 18_000_000n,   bonus: 4_000_000n,   stock: 15_000_000n,   total_compensation: 37_000_000n,   source: 'CONTRIBUTOR', confidence_score: 0.88, is_verified: true  },

    // ── Microsoft (L4–PRINCIPAL, Hyderabad/Bengaluru, INR) ──────────────────
    { company_id: msft.id, role: 'Software Engineer II', level: 'L4',       location: 'Hyderabad',  currency: 'INR', experience_years: 3,  base_salary: 25_00_000_00n, bonus: 3_00_000_00n, stock: 6_00_000_00n,  total_compensation: 34_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.91, is_verified: true  },
    { company_id: msft.id, role: 'Senior SWE',           level: 'L5',       location: 'Hyderabad',  currency: 'INR', experience_years: 6,  base_salary: 40_00_000_00n, bonus: 7_00_000_00n, stock: 15_00_000_00n, total_compensation: 62_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.90, is_verified: true  },
    { company_id: msft.id, role: 'Staff Engineer',       level: 'STAFF',    location: 'Bengaluru',  currency: 'INR', experience_years: 10, base_salary: 55_00_000_00n, bonus: 12_00_000_00n,stock: 30_00_000_00n, total_compensation: 97_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.87, is_verified: true  },
    { company_id: msft.id, role: 'Principal Engineer',   level: 'PRINCIPAL', location: 'Bengaluru', currency: 'INR', experience_years: 14, base_salary: 70_00_000_00n, bonus: 18_00_000_00n,stock: 50_00_000_00n, total_compensation: 1_38_00_000_00n,source: 'CONTRIBUTOR', confidence_score: 0.86, is_verified: true  },

    // ── Flipkart (SDE_I–SDE_III, Bengaluru, INR) ────────────────────────────
    { company_id: flipkart.id, role: 'Software Dev Engineer', level: 'SDE_I',   location: 'Bengaluru', currency: 'INR', experience_years: 2, base_salary: 14_00_000_00n, bonus: 1_50_000_00n, stock: 2_00_000_00n,  total_compensation: 17_50_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.89, is_verified: true  },
    { company_id: flipkart.id, role: 'Software Dev Engineer', level: 'SDE_II',  location: 'Bengaluru', currency: 'INR', experience_years: 5, base_salary: 28_00_000_00n, bonus: 4_00_000_00n, stock: 8_00_000_00n,  total_compensation: 40_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.90, is_verified: true  },
    { company_id: flipkart.id, role: 'Software Dev Engineer', level: 'SDE_III', location: 'Bengaluru', currency: 'INR', experience_years: 8, base_salary: 45_00_000_00n, bonus: 8_00_000_00n, stock: 20_00_000_00n, total_compensation: 73_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.88, is_verified: true  },

    // ── Meesho (SDE_I–SDE_II, Bengaluru, INR) ───────────────────────────────
    { company_id: meesho.id, role: 'Software Engineer', level: 'SDE_I',  location: 'Bengaluru', currency: 'INR', experience_years: 2, base_salary: 12_00_000_00n, bonus: 1_00_000_00n, stock: 1_50_000_00n, total_compensation: 14_50_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.87, is_verified: false },
    { company_id: meesho.id, role: 'Software Engineer', level: 'SDE_II', location: 'Bengaluru', currency: 'INR', experience_years: 4, base_salary: 22_00_000_00n, bonus: 2_50_000_00n, stock: 4_00_000_00n, total_compensation: 28_50_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.86, is_verified: false },

    // ── TCS (L3–L5, Mumbai/Pune/Delhi, INR) ─────────────────────────────────
    { company_id: tcs.id, role: 'Associate Consultant', level: 'L3', location: 'Mumbai', currency: 'INR', experience_years: 2, base_salary:  6_50_000_00n, bonus: 50_000_00n,  stock: 0n,           total_compensation:  7_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.88, is_verified: true  },
    { company_id: tcs.id, role: 'Consultant',           level: 'L4', location: 'Pune',   currency: 'INR', experience_years: 5, base_salary: 10_00_000_00n, bonus: 1_00_000_00n, stock: 0n,           total_compensation: 11_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.87, is_verified: true  },
    { company_id: tcs.id, role: 'Senior Consultant',    level: 'L5', location: 'Delhi',  currency: 'INR', experience_years: 9, base_salary: 16_00_000_00n, bonus: 2_00_000_00n, stock: 0n,           total_compensation: 18_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.85, is_verified: true  },

    // ── Infosys (L3–L4, Bengaluru/Hyderabad, INR) ───────────────────────────
    { company_id: infosys.id, role: 'Systems Engineer', level: 'L3', location: 'Bengaluru', currency: 'INR', experience_years: 2,  base_salary:  5_50_000_00n, bonus: 40_000_00n, stock: 0n, total_compensation:  5_90_000_00n, source: 'SCRAPED', confidence_score: 0.65, is_verified: false },
    { company_id: infosys.id, role: 'Senior Engineer',  level: 'L4', location: 'Hyderabad', currency: 'INR', experience_years: 5,  base_salary:  9_00_000_00n, bonus: 80_000_00n, stock: 0n, total_compensation:  9_80_000_00n, source: 'SCRAPED', confidence_score: 0.63, is_verified: false },

    // ── Razorpay (SDE_I–STAFF, Bengaluru, INR) ──────────────────────────────
    { company_id: razor.id, role: 'Software Engineer', level: 'SDE_I',  location: 'Bengaluru', currency: 'INR', experience_years: 2,  base_salary: 16_00_000_00n, bonus: 1_50_000_00n, stock: 2_50_000_00n, total_compensation: 20_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.90, is_verified: true  },
    { company_id: razor.id, role: 'Software Engineer', level: 'SDE_II', location: 'Bengaluru', currency: 'INR', experience_years: 5,  base_salary: 28_00_000_00n, bonus: 3_00_000_00n, stock: 6_00_000_00n, total_compensation: 37_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.89, is_verified: true  },
    { company_id: razor.id, role: 'Staff Engineer',    level: 'STAFF',  location: 'Bengaluru', currency: 'INR', experience_years: 10, base_salary: 50_00_000_00n, bonus: 10_00_000_00n,stock: 25_00_000_00n,total_compensation: 85_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.87, is_verified: true  },

    // ── Zepto (SDE_I–SDE_II, Mumbai, INR) ───────────────────────────────────
    { company_id: zepto.id, role: 'Software Engineer', level: 'SDE_I',  location: 'Mumbai', currency: 'INR', experience_years: 2, base_salary: 13_00_000_00n, bonus: 1_00_000_00n, stock: 1_50_000_00n, total_compensation: 15_50_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.85, is_verified: false },
    { company_id: zepto.id, role: 'Software Engineer', level: 'SDE_II', location: 'Mumbai', currency: 'INR', experience_years: 4, base_salary: 22_00_000_00n, bonus: 2_00_000_00n, stock: 4_00_000_00n, total_compensation: 28_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.84, is_verified: false },

    // ── NVIDIA (L4–PRINCIPAL, Bengaluru/Santa Clara, INR+USD) ───────────────
    // Edge: experience_years = 49
    { company_id: nvidia.id, role: 'Deep Learning Engineer', level: 'L4',       location: 'Bengaluru',   currency: 'INR', experience_years: 4,  base_salary: 35_00_000_00n, bonus: 5_00_000_00n, stock: 12_00_000_00n, total_compensation: 52_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.90, is_verified: true  },
    { company_id: nvidia.id, role: 'Senior Engineer',         level: 'L5',       location: 'Bengaluru',   currency: 'INR', experience_years: 7,  base_salary: 55_00_000_00n, bonus: 10_00_000_00n,stock: 30_00_000_00n, total_compensation: 95_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.89, is_verified: true  },
    { company_id: nvidia.id, role: 'Staff Engineer',          level: 'L6',       location: 'Santa Clara', currency: 'USD', experience_years: 10, base_salary: 28_000_000n,   bonus: 6_000_000n,   stock: 20_000_000n,   total_compensation: 54_000_000n,   source: 'CONTRIBUTOR', confidence_score: 0.91, is_verified: true  },
    { company_id: nvidia.id, role: 'Principal Engineer',      level: 'PRINCIPAL', location: 'Santa Clara', currency: 'USD', experience_years: 49, base_salary: 38_000_000n,   bonus: 10_000_000n,  stock: 40_000_000n,   total_compensation: 88_000_000n,   source: 'AI_INFERRED', confidence_score: 0.55, is_verified: false },

    // ── Wipro (L3–L4, Pune/Hyderabad, INR) ──────────────────────────────────
    { company_id: wipro.id, role: 'Project Engineer', level: 'L3', location: 'Pune',      currency: 'INR', experience_years: 2, base_salary:  5_00_000_00n, bonus: 30_000_00n, stock: 0n, total_compensation:  5_30_000_00n, source: 'SCRAPED', confidence_score: 0.60, is_verified: false },
    { company_id: wipro.id, role: 'Senior Engineer',  level: 'L4', location: 'Hyderabad', currency: 'INR', experience_years: 5, base_salary:  8_50_000_00n, bonus: 70_000_00n, stock: 0n, total_compensation:  9_20_000_00n, source: 'SCRAPED', confidence_score: 0.58, is_verified: false },

  ]});

  // Additional records to reach 60+ and cover more edge cases
  await prisma.salary.createMany({ data: [

    // Extra Google records for richer distribution
    { company_id: google.id, role: 'ML Engineer',     level: 'L5', location: 'Bengaluru',    currency: 'INR', experience_years: 6,  base_salary: 48_00_000_00n, bonus: 9_00_000_00n, stock: 22_00_000_00n, total_compensation: 79_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.90, is_verified: true  },
    { company_id: google.id, role: 'SRE',             level: 'L4', location: 'Hyderabad',    currency: 'INR', experience_years: 3,  base_salary: 26_00_000_00n, bonus: 3_50_000_00n, stock: 6_00_000_00n,  total_compensation: 35_50_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.88, is_verified: true  },
    { company_id: google.id, role: 'Software Engineer',level: 'IC4',location: 'San Francisco', currency: 'USD', experience_years: 8, base_salary: 30_000_000n,   bonus: 7_000_000n,   stock: 25_000_000n,   total_compensation: 62_000_000n,   source: 'CONTRIBUTOR', confidence_score: 0.89, is_verified: true  },
    { company_id: google.id, role: 'Principal SWE',   level: 'IC5', location: 'San Francisco', currency: 'USD', experience_years: 12,base_salary: 40_000_000n,   bonus: 12_000_000n,  stock: 50_000_000n,   total_compensation: 1_02_000_000n, source: 'CONTRIBUTOR', confidence_score: 0.87, is_verified: true  },

    // Extra Amazon
    { company_id: amazon.id, role: 'SDE',       level: 'SDE_I',   location: 'Mumbai',    currency: 'INR', experience_years: 2,  base_salary: 17_00_000_00n, bonus: 1_50_000_00n, stock: 2_50_000_00n, total_compensation: 21_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.88, is_verified: true  },
    { company_id: amazon.id, role: 'SDE',       level: 'SDE_II',  location: 'Mumbai',    currency: 'INR', experience_years: 5,  base_salary: 30_00_000_00n, bonus: 4_50_000_00n, stock: 9_00_000_00n, total_compensation: 43_50_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.89, is_verified: true  },

    // Extra Microsoft
    { company_id: msft.id, role: 'PM',          level: 'L4', location: 'Hyderabad',       currency: 'INR', experience_years: 4,  base_salary: 26_00_000_00n, bonus: 4_00_000_00n, stock: 7_00_000_00n,  total_compensation: 37_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.87, is_verified: true  },
    { company_id: msft.id, role: 'Senior PM',   level: 'L5', location: 'Bengaluru',        currency: 'INR', experience_years: 7,  base_salary: 38_00_000_00n, bonus: 6_00_000_00n, stock: 12_00_000_00n, total_compensation: 56_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.86, is_verified: true  },

    // Extra Flipkart
    { company_id: flipkart.id, role: 'Backend Engineer', level: 'SDE_I', location: 'Bengaluru', currency: 'INR', experience_years: 2, base_salary: 13_50_000_00n, bonus: 1_20_000_00n, stock: 1_80_000_00n, total_compensation: 16_50_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.86, is_verified: false },

    // Extra TCS
    { company_id: tcs.id, role: 'IT Analyst',  level: 'L4', location: 'Mumbai', currency: 'INR', experience_years: 4, base_salary:  8_50_000_00n, bonus: 80_000_00n, stock: 0n, total_compensation: 9_30_000_00n, source: 'SCRAPED', confidence_score: 0.62, is_verified: false },
    { company_id: tcs.id, role: 'Tech Lead',   level: 'L5', location: 'Pune',   currency: 'INR', experience_years: 8, base_salary: 14_00_000_00n, bonus: 1_50_000_00n,stock: 0n, total_compensation: 15_50_000_00n,source: 'SCRAPED', confidence_score: 0.60, is_verified: false },

    // Extra Infosys
    { company_id: infosys.id, role: 'Lead Engineer', level: 'L4', location: 'Bengaluru', currency: 'INR', experience_years: 7, base_salary: 12_00_000_00n, bonus: 1_00_000_00n, stock: 0n, total_compensation: 13_00_000_00n, source: 'SCRAPED', confidence_score: 0.61, is_verified: false },

    // Extra Razorpay
    { company_id: razor.id, role: 'Backend Engineer', level: 'SDE_I', location: 'Bengaluru', currency: 'INR', experience_years: 3, base_salary: 18_00_000_00n, bonus: 2_00_000_00n, stock: 3_00_000_00n, total_compensation: 23_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.88, is_verified: true },

    // Extra Zepto
    { company_id: zepto.id, role: 'Backend Engineer', level: 'SDE_I', location: 'Mumbai', currency: 'INR', experience_years: 2, base_salary: 12_50_000_00n, bonus: 90_000_00n, stock: 1_00_000_00n, total_compensation: 14_40_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.83, is_verified: false },

    // Extra NVIDIA
    { company_id: nvidia.id, role: 'VLSI Engineer', level: 'L4', location: 'Bengaluru', currency: 'INR', experience_years: 4, base_salary: 32_00_000_00n, bonus: 4_00_000_00n, stock: 10_00_000_00n, total_compensation: 46_00_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.88, is_verified: true },

    // Extra Wipro
    { company_id: wipro.id, role: 'Tech Lead', level: 'L4', location: 'Pune', currency: 'INR', experience_years: 7, base_salary: 10_00_000_00n, bonus: 90_000_00n, stock: 0n, total_compensation: 10_90_000_00n, source: 'SCRAPED', confidence_score: 0.57, is_verified: false },

    // Extra Meesho
    { company_id: meesho.id, role: 'Backend Engineer', level: 'SDE_I', location: 'Bengaluru', currency: 'INR', experience_years: 2, base_salary: 11_50_000_00n, bonus: 80_000_00n, stock: 1_00_000_00n, total_compensation: 13_30_000_00n, source: 'CONTRIBUTOR', confidence_score: 0.84, is_verified: false },

    // Extra Meta
    { company_id: meta.id, role: 'Production Engineer', level: 'L4', location: 'San Francisco', currency: 'USD', experience_years: 3, base_salary: 17_000_000n, bonus: 3_000_000n, stock: 7_000_000n, total_compensation: 27_000_000n, source: 'CONTRIBUTOR', confidence_score: 0.90, is_verified: true },

  ]});

  const count = await prisma.salary.count();
  console.log(`✅ Seed complete — ${count} salary records inserted`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
