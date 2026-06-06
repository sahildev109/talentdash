import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl text-center">
      <h3 className="text-lg font-semibold text-[#222222] mb-2">
        No records found. Try removing a filter.
      </h3>
      <Link
        href="/salaries"
        className="text-[#1E3A5F] hover:text-[#152943] font-medium underline transition-colors"
      >
        Clear all filters
      </Link>
    </div>
  );
}
