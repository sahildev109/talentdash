import { Metadata } from 'next';
import { formatINR } from './formatters';

/**
 * generateSalaryPageMetadata
 * Generates SEO metadata for role-specific salary pages, optionally filtered by company and/or location.
 * Spec 6.1
 */
export function generateSalaryPageMetadata(
  role: string,
  company?: string,
  location?: string
): Metadata {
  const titleParts = [role];
  if (company) titleParts.push(`at ${company}`);
  if (location) titleParts.push(`in ${location}`);
  titleParts.push('India');

  const title = `${titleParts.join(' ')} - L3 to Staff Salaries | TalentDash`;

  const description =
    `Verified ${role} salaries${company ? ` at ${company}` : ''}` +
    `${location ? ` in ${location}` : ' across India'}. Level-by-level compensation data ` +
    `including base, bonus, and stock. Updated ${new Date().getFullYear()}.`;

  const url = company
    ? `https://talentdash.com/salaries/${role.toLowerCase().replace(/ /g, '-')}/${company.toLowerCase()}`
    : `https://talentdash.com/salaries/${role.toLowerCase().replace(/ /g, '-')}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'TalentDash',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * generateCompanyPageMetadata
 * Generates SEO metadata for company-specific pages.
 * Spec 6.3: Title "[Company] Salaries & Reviews India | TalentDash"
 */
export function generateCompanyPageMetadata(
  companyName: string,
  slug: string,
  medianTC?: number
): Metadata {
  const title = `${companyName} Salaries & Reviews India | TalentDash`;

  // Format the median compensation if available
  const formattedMedian = medianTC && medianTC > 0 ? formatINR(medianTC) : '';

  const description = formattedMedian
    ? `Explore verified salary records at ${companyName} in India. The median total compensation is ${formattedMedian}. View level-by-level breakdown, base salary, bonus, and stock details.`
    : `Explore verified salary records at ${companyName} in India. View level-by-level breakdown, base salary, bonus, and stock details.`;

  const canonical = `https://talentdash.com/companies/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'TalentDash',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * generateSalariesMetadata
 * Generates SEO metadata for the /salaries index directory page, incorporating filter parameters.
 */
export function generateSalariesMetadata(
  searchParams?: Record<string, string | string[] | undefined>
): Metadata {
  const role = typeof searchParams?.role === 'string' ? searchParams.role : '';
  const company = typeof searchParams?.company === 'string' ? searchParams.company : '';
  const location = typeof searchParams?.location === 'string' ? searchParams.location : '';
  const level = typeof searchParams?.level === 'string' ? searchParams.level : '';

  // Title building
  let title = 'Software Engineer Salaries India - L3 to Staff | TalentDash';
  if (role || company || location || level) {
    const titleParts = [role || 'Tech'];
    if (company) titleParts.push(`at ${company}`);
    if (level) titleParts.push(`(${level})`);
    if (location) titleParts.push(`in ${location}`);
    titleParts.push('India');
    title = `${titleParts.join(' ')} - Level Breakdown | TalentDash`;
  }

  // Description building
  let description = 'Search and compare tech and non-tech salaries in India. Explore verified database including base salary, bonus, stock options, and levels from L3 to Principal.';
  if (role || company || location || level) {
    const descParts = [`Browse verified ${role || 'tech'} salaries`];
    if (company) descParts.push(`at ${company}`);
    if (location) descParts.push(`in ${location}`);
    else descParts.push(`across India`);
    if (level) descParts.push(`for ${level} level`);
    descParts.push(`including base, bonus, and stock details. Updated ${new Date().getFullYear()}.`);
    description = descParts.join(' ');
  }

  const canonical = 'https://talentdash.com/salaries';

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'TalentDash',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
