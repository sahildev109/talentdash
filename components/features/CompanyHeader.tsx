import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import { Company } from '@/types';
import { formatINR } from '@/lib/formatters';

interface CompanyHeaderProps {
  company: Company;
  medianTC: number;
}

export default function CompanyHeader({ company, medianTC }: CompanyHeaderProps) {
  // Check if logo exists in public/logos/ on the server
  const logoPath = path.join(process.cwd(), 'public', 'logos', `${company.slug}.png`);
  const hasLogo = fs.existsSync(logoPath);
  const logoUrl = `/logos/${company.slug}.png`;

  // Get the first letter of the company name as a fallback initial
  const initial = company.name ? company.name.charAt(0).toUpperCase() : '';

  return (
    <div className="bg-white rounded-xl border border-[#EBEBEB] p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Company Logo container */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#F7F7F7] border border-[#EBEBEB] flex items-center justify-center text-2xl font-bold text-[#1E3A5F] shrink-0">
          {hasLogo ? (
            <Image
              src={logoUrl}
              alt={`${company.name} logo`}
              width={64}
              height={64}
              priority
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] select-none">
              {initial}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-[#222222]">{company.name}</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-[#717171]">
            {company.industry && <span>{company.industry}</span>}
            {company.industry && (company.headquarters || company.founded_year || company.headcount_range) && <span>•</span>}
            
            {company.headquarters && <span>{company.headquarters}</span>}
            {company.headquarters && (company.founded_year || company.headcount_range) && <span>•</span>}
            
            {company.founded_year && <span>Founded {company.founded_year}</span>}
            {company.founded_year && company.headcount_range && <span>•</span>}
            
            {company.headcount_range && <span>{company.headcount_range} employees</span>}
          </div>
        </div>
      </div>

      {/* Median Total Compensation Display */}
      <div className="bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl p-4 min-w-[200px] flex flex-col items-start md:items-end">
        <span className="text-xs text-[#717171] font-semibold uppercase tracking-wider">Median Total Comp</span>
        <span className="text-2xl font-extrabold text-[#1E3A5F] mt-1">
          {medianTC && medianTC > 0 ? formatINR(medianTC) : '-'}
        </span>
      </div>
    </div>
  );
}
