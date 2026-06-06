import { PrismaSalaryWithCompany, Company } from '@/types';
import { formatINR } from './formatters';

/**
 * buildSalaryJsonLd
 * Builds schema.org/Dataset JSON-LD structure for salary search/filter pages.
 * Spec 6.2
 */
export function buildSalaryJsonLd(salaries: PrismaSalaryWithCompany[], pageTitle: string) {
  const roleName = salaries.length > 0 ? salaries[0].role : 'technology roles';
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'Dataset' as const,
    name: pageTitle,
    description: `Salary dataset for ${roleName} in India, showing levels, locations, and compensation components.`,
    url: 'https://talentdash.com/salaries',
    creator: {
      '@type': 'Organization' as const,
      name: 'TalentDash',
    },
    distribution: [
      {
        '@type': 'DataDownload' as const,
        encodingFormat: 'application/json',
        contentUrl: 'https://talentdash.com/api/salaries',
      },
    ],
    variableMeasured: ['base_salary', 'total_compensation', 'level', 'location'],
  };
}

/**
 * buildCompanyJsonLd
 * Builds schema.org/Organization JSON-LD structure for company profile pages.
 */
export function buildCompanyJsonLd(company: Company, medianTC?: number) {
  const formattedMedian = medianTC && medianTC > 0 ? formatINR(medianTC) : '';
  const description = formattedMedian
    ? `Verified salary profiles, levels, and compensation details for ${company.name} in India. The median total compensation is ${formattedMedian}.`
    : `Verified salary profiles, levels, and compensation details for ${company.name} in India.`;

  return {
    '@context': 'https://schema.org' as const,
    '@type': 'Organization' as const,
    name: company.name,
    url: `https://talentdash.com/companies/${company.slug}`,
    description,
  };
}

// Exported types for both return values
export type SalaryDatasetJsonLd = ReturnType<typeof buildSalaryJsonLd>;
export type CompanyOrganizationJsonLd = ReturnType<typeof buildCompanyJsonLd>;
