import { Level } from '@/types';

interface LevelBadgeProps {
  level: Level;
}

export default function LevelBadge({ level }: LevelBadgeProps) {
  let colorClasses = '';

  switch (level) {
    case 'L3':
    case 'SDE_I':
      colorClasses = 'bg-slate-100 text-slate-700';
      break;
    case 'L4':
    case 'SDE_II':
      colorClasses = 'bg-blue-100 text-blue-700';
      break;
    case 'L5':
    case 'SDE_III':
      colorClasses = 'bg-indigo-100 text-indigo-700';
      break;
    case 'L6':
    case 'STAFF':
      colorClasses = 'bg-purple-100 text-purple-700';
      break;
    case 'PRINCIPAL':
    case 'IC4':
    case 'IC5':
      colorClasses = 'bg-[#1E3A5F] text-white';
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-700';
  }

  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium inline-block ${colorClasses}`}>
      {level}
    </span>
  );
}
