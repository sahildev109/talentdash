import { PrismaSalaryWithCompany, Level } from '@/types';
import { LEVEL_COLORS } from '@/lib/constants';

interface LevelDistributionProps {
  salaries: PrismaSalaryWithCompany[];
}

export default function LevelDistribution({ salaries }: LevelDistributionProps) {
  const total = salaries.length;
  if (total === 0) return null;

  // Aggregate counts per level
  const counts = salaries.reduce((acc, s) => {
    acc[s.level] = (acc[s.level] ?? 0) + 1;
    return acc;
  }, {} as Record<Level, number>);

  return (
    <section className="bg-white rounded-xl border border-[#EBEBEB] p-6 mb-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#222222] mb-4">Level Distribution</h2>
      
      {/* Horizontal Stacked Bar */}
      <div className="flex h-6 rounded-full overflow-hidden w-full bg-[#F7F7F7] border border-[#EBEBEB]">
        {Object.entries(counts).map(([level, count]) => {
          const pct = (count / total) * 100;
          return (
            <div
              key={level}
              style={{ width: `${pct}%`, backgroundColor: LEVEL_COLORS[level as Level] }}
              title={`${level}: ${count} records (${Math.round(pct)}%)`}
              className="h-full transition-all duration-300"
            />
          );
        })}
      </div>

      {/* Legend below the bar */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
        {Object.entries(counts).map(([level, count]) => {
          const pct = (count / total) * 100;
          return (
            <span key={level} className="text-xs text-[#484848] flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full inline-block border border-black/5"
                style={{ backgroundColor: LEVEL_COLORS[level as Level] }}
              />
              <span className="font-medium">{level}:</span> {count} {count === 1 ? 'record' : 'records'} ({Math.round(pct)}%)
            </span>
          );
        })}
      </div>
    </section>
  );
}
