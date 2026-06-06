// components/features/SalaryTable.tsx
// React Server Component — NO 'use client'. Zero client JS shipped for the table.
//
// WHY pure <a> tags for pagination:
//   Pagination is URL-state driven. An <a href="?page=N"> requires no JS, works
//   with SSR, and the browser handles it natively. Using <Link> from next/navigation
//   would be fine too, but a plain anchor is even lighter.
//
// WHY fixed column widths:
//   Without explicit widths, the browser reflows columns on every render as data loads,
//   causing CLS (Cumulative Layout Shift). Fixed Tailwind widths pin each column so the
//   skeleton and the real table occupy exactly the same space. CLS target: < 0.1.

import { PrismaSalaryWithCompany } from '@/types';
import LevelBadge from '@/components/ui/LevelBadge';
import SalaryCell from '@/components/ui/SalaryCell';
import EmptyState from '@/components/ui/EmptyState';

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SalaryTableProps {
  salaries: PrismaSalaryWithCompany[];
  meta: Meta;
  showCompareButton?: boolean;
}

// Column header definitions with fixed widths to prevent CLS.
// Widths are chosen so the full 11-column table fits a 7xl container without scrolling.
const COLUMNS = [
  { label: 'Company',    width: 'w-[160px] min-w-[160px]' },
  { label: 'Role',       width: 'w-[160px] min-w-[160px]' },
  { label: 'Level',      width: 'w-[96px]  min-w-[96px]'  },
  { label: 'Location',   width: 'w-[120px] min-w-[120px]' },
  { label: 'Base',       width: 'w-[108px] min-w-[108px]' },
  { label: 'Bonus',      width: 'w-[96px]  min-w-[96px]'  },
  { label: 'Stock',      width: 'w-[96px]  min-w-[96px]'  },
  { label: 'Total TC',   width: 'w-[112px] min-w-[112px]' },
  { label: 'YOE',        width: 'w-[56px]  min-w-[56px]'  },
  { label: 'Source',     width: 'w-[96px]  min-w-[96px]'  },
  { label: '✓',          width: 'w-[40px]  min-w-[40px]'  },
];

function buildPageHref(page: number, currentParams: string): string {
  // Preserve all existing search params, just replace/add `page`
  const params = new URLSearchParams(currentParams);
  params.set('page', String(page));
  return `/salaries?${params.toString()}`;
}

export default function SalaryTable({
  salaries,
  meta,
  showCompareButton = false,
}: SalaryTableProps) {
  // Edge case (section 9.2): empty state when no records match filters
  if (salaries.length === 0) {
    return <EmptyState />;
  }

  const { page, totalPages, total, limit } = meta;

  // Build a serialised query string representation without `page` for reuse
  // NOTE: We cannot call useSearchParams() here — this is an RSC. Pagination
  // links use relative ?page=N approach; other params are preserved server-side
  // when the parent page.tsx passes the constructed href. For simplicity we
  // rely on plain ?page=N links here; the parent page owns param forwarding.
  const showingFrom = (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, total);

  return (
    <section className="w-full">
      {/* Record count summary */}
      <p className="text-sm text-[#717171] mb-3">
        Showing {showingFrom.toLocaleString()}–{showingTo.toLocaleString()} of{' '}
        {total.toLocaleString()} records
      </p>

      {/* Horizontally scrollable wrapper so narrow viewports never break layout */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="table-fixed text-sm text-[#222222] border-collapse w-full">
          <colgroup>
            {COLUMNS.map((col) => (
              <col key={col.label} className={col.width} />
            ))}
          </colgroup>

          <thead>
            <tr className="border-b border-gray-100 bg-white">
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  className={`${col.width} px-4 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {salaries.map((salary, idx) => (
              <tr
                key={salary.id}
                className={`border-b border-gray-50 hover:bg-red-50/30 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFCFC]'
                }`}
              >
                {/* Company — truncate so 40+ char names don't break layout (edge case 9.2) */}
                <td className="px-4 py-3">
                  <span
                    className="block truncate max-w-[148px] font-medium text-[#222222]"
                    title={salary.company.name}
                  >
                    {salary.company.name}
                  </span>
                </td>

                {/* Role — also truncate defensively */}
                <td className="px-4 py-3">
                  <span
                    className="block truncate max-w-[148px] text-[#484848]"
                    title={salary.role}
                  >
                    {salary.role}
                  </span>
                </td>

                {/* Level — colored badge */}
                <td className="px-4 py-3">
                  <LevelBadge level={salary.level} />
                </td>

                {/* Location */}
                <td className="px-4 py-3 text-gray-500 truncate">
                  {salary.location}
                </td>

                {/* Base salary — 0n renders "-" via formatSalary */}
                <td className="px-4 py-3 font-mono text-[#222222] tabular-nums">
                  <SalaryCell
                    amount={salary.base_salary}
                    currency={salary.currency}
                  />
                </td>

                {/* Bonus — 0n renders "-" */}
                <td className="px-4 py-3 font-mono text-gray-500 tabular-nums">
                  <SalaryCell
                    amount={salary.bonus}
                    currency={salary.currency}
                  />
                </td>

                {/* Stock — 0n renders "-" */}
                <td className="px-4 py-3 font-mono text-gray-500 tabular-nums">
                  <SalaryCell
                    amount={salary.stock}
                    currency={salary.currency}
                  />
                </td>

                {/* Total Compensation — bold, primary emphasis */}
                <td className="px-4 py-3 font-mono font-extrabold text-[#222222] tabular-nums">
                  <SalaryCell
                    amount={salary.total_compensation}
                    currency={salary.currency}
                  />
                </td>

                {/* Years of Experience */}
                <td className="px-4 py-3 text-center text-gray-500 font-medium">
                  {salary.experience_years}
                </td>

                {/* Source badge */}
                <td className="px-4 py-3">
                  <span className="text-xs text-[#717171]">
                    {salary.source === 'CONTRIBUTOR'
                      ? 'User'
                      : salary.source === 'SCRAPED'
                      ? 'Scraped'
                      : 'AI'}
                  </span>
                </td>

                {/* Verified checkmark */}
                <td className="px-4 py-3 text-center">
                  {salary.is_verified ? (
                    <span className="text-[#008A05]" aria-label="Verified">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[#BBBBBB]" aria-label="Unverified">
                      –
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination — pure <a> tags, no JS required (section 12.1) */}
      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between mt-4"
        >
          <span className="text-sm text-[#717171]">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <a
                href={`?page=${page - 1}`}
                className="px-5 py-2.5 text-sm font-bold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-red-50 hover:text-[#FF385C] hover:border-red-100 transition-all shadow-sm"
              >
                &larr; Previous
              </a>
            ) : (
              <span className="px-5 py-2.5 text-sm font-bold rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed">
                &larr; Previous
              </span>
            )}

            {page < totalPages ? (
              <a
                href={`?page=${page + 1}`}
                className="px-5 py-2.5 text-sm font-bold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-red-50 hover:text-[#FF385C] hover:border-red-100 transition-all shadow-sm"
              >
                Next &rarr;
              </a>
            ) : (
              <span className="px-5 py-2.5 text-sm font-bold rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed">
                Next &rarr;
              </span>
            )}
          </div>
        </nav>
      )}
    </section>
  );
}
