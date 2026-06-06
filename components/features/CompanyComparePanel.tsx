import { formatINR } from '@/lib/formatters';

export interface CompanyCompareResult {
  company_1: {
    name: string;
    slug: string;
    recordCount: number;
    medianBase: number;
    medianBonus: number;
    medianStock: number;
    medianTc: number;
    medianYoe: number;
    topRole: string;
    entryTc: number;
    seniorTc: number;
  };
  company_2: {
    name: string;
    slug: string;
    recordCount: number;
    medianBase: number;
    medianBonus: number;
    medianStock: number;
    medianTc: number;
    medianYoe: number;
    topRole: string;
    entryTc: number;
    seniorTc: number;
  };
  delta: {
    base_delta: number;
    bonus_delta: number;
    stock_delta: number;
    tc_delta: number;
    entry_tc_delta: number;
    senior_tc_delta: number;
    experience_delta: number;
  };
}

export function fmtDelta(val: number): string {
  const abs = formatINR(Math.abs(val));
  return val > 0 ? `+${abs}` : val < 0 ? `-${abs}` : '-';
}

export function deltaColor(val: number): string {
  return val > 0 ? 'text-[#008A05]' : val < 0 ? 'text-[#D93025]' : 'text-[#717171]';
}

export default function CompanyComparePanel({ result }: { result: CompanyCompareResult }) {
  const { company_1: c1, company_2: c2, delta } = result;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-xs w-1/4">Metric</th>
              <th className="px-6 py-4 font-extrabold text-xl text-[#222222] w-1/4">{c1.name}</th>
              <th className="px-6 py-4 font-extrabold text-xl text-[#222222] w-1/4">{c2.name}</th>
              <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-xs w-1/4">Difference (C1 - C2)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* Median Total Comp */}
            <tr className="hover:bg-red-50/30 transition-colors">
              <td className="px-6 py-5 font-bold text-gray-700">Median Total Comp</td>
              <td className="px-6 py-5 font-mono text-lg text-[#222222]">{formatINR(c1.medianTc)}</td>
              <td className="px-6 py-5 font-mono text-lg text-[#222222]">{formatINR(c2.medianTc)}</td>
              <td className={`px-6 py-5 font-mono font-bold ${deltaColor(delta.tc_delta)}`}>
                {fmtDelta(delta.tc_delta)}
              </td>
            </tr>

            {/* Median Base */}
            <tr className="hover:bg-red-50/30 transition-colors">
              <td className="px-6 py-5 font-bold text-gray-700">Median Base Salary</td>
              <td className="px-6 py-5 font-mono text-gray-600">{formatINR(c1.medianBase)}</td>
              <td className="px-6 py-5 font-mono text-gray-600">{formatINR(c2.medianBase)}</td>
              <td className={`px-6 py-5 font-mono font-bold ${deltaColor(delta.base_delta)}`}>
                {fmtDelta(delta.base_delta)}
              </td>
            </tr>

            {/* Median Bonus */}
            <tr className="hover:bg-red-50/30 transition-colors">
              <td className="px-6 py-5 font-bold text-gray-700">Median Bonus</td>
              <td className="px-6 py-5 font-mono text-gray-600">{formatINR(c1.medianBonus)}</td>
              <td className="px-6 py-5 font-mono text-gray-600">{formatINR(c2.medianBonus)}</td>
              <td className={`px-6 py-5 font-mono font-bold ${deltaColor(delta.bonus_delta)}`}>
                {fmtDelta(delta.bonus_delta)}
              </td>
            </tr>

            {/* Median Stock */}
            <tr className="hover:bg-red-50/30 transition-colors">
              <td className="px-6 py-5 font-bold text-gray-700">Median Stock (RSU/Options)</td>
              <td className="px-6 py-5 font-mono text-gray-600">{formatINR(c1.medianStock)}</td>
              <td className="px-6 py-5 font-mono text-gray-600">{formatINR(c2.medianStock)}</td>
              <td className={`px-6 py-5 font-mono font-bold ${deltaColor(delta.stock_delta)}`}>
                {fmtDelta(delta.stock_delta)}
              </td>
            </tr>

            {/* Entry Level TC */}
            <tr className="hover:bg-red-50/30 transition-colors">
              <td className="px-6 py-5 font-bold text-gray-700">Entry-Level TC (0-2 YOE)</td>
              <td className="px-6 py-5 font-mono text-gray-600">{formatINR(c1.entryTc)}</td>
              <td className="px-6 py-5 font-mono text-gray-600">{formatINR(c2.entryTc)}</td>
              <td className={`px-6 py-5 font-mono font-bold ${deltaColor(delta.entry_tc_delta)}`}>
                {fmtDelta(delta.entry_tc_delta)}
              </td>
            </tr>

            {/* Senior Level TC */}
            <tr className="hover:bg-red-50/30 transition-colors">
              <td className="px-6 py-5 font-bold text-gray-700">Senior-Level TC (5+ YOE)</td>
              <td className="px-6 py-5 font-mono text-gray-600">{formatINR(c1.seniorTc)}</td>
              <td className="px-6 py-5 font-mono text-gray-600">{formatINR(c2.seniorTc)}</td>
              <td className={`px-6 py-5 font-mono font-bold ${deltaColor(delta.senior_tc_delta)}`}>
                {fmtDelta(delta.senior_tc_delta)}
              </td>
            </tr>

            {/* Median YOE */}
            <tr className="hover:bg-red-50/30 transition-colors">
              <td className="px-6 py-5 font-bold text-gray-700">Median Experience</td>
              <td className="px-6 py-5 text-gray-600">{c1.medianYoe.toFixed(1)} yrs</td>
              <td className="px-6 py-5 text-gray-600">{c2.medianYoe.toFixed(1)} yrs</td>
              <td className="px-6 py-5 font-bold text-gray-500">
                {delta.experience_delta > 0 ? `+${delta.experience_delta.toFixed(1)}` : delta.experience_delta < 0 ? delta.experience_delta.toFixed(1) : '-'} yrs
              </td>
            </tr>

            {/* Top Role */}
            <tr className="hover:bg-red-50/30 transition-colors">
              <td className="px-6 py-5 font-bold text-gray-700">Most Common Role</td>
              <td className="px-6 py-5 text-gray-600">{c1.topRole}</td>
              <td className="px-6 py-5 text-gray-600">{c2.topRole}</td>
              <td className="px-6 py-5 text-gray-400 text-xs italic">N/A</td>
            </tr>

            {/* Total Records */}
            <tr className="hover:bg-red-50/30 transition-colors bg-gray-50/50">
              <td className="px-6 py-5 font-bold text-gray-700">Data Points</td>
              <td className="px-6 py-5 text-gray-600">{c1.recordCount.toLocaleString()} salaries</td>
              <td className="px-6 py-5 text-gray-600">{c2.recordCount.toLocaleString()} salaries</td>
              <td className="px-6 py-5 text-gray-400 text-xs italic">Confidence metric</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
