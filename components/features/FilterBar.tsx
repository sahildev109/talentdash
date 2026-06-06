'use client';

// components/features/FilterBar.tsx
// The ONLY 'use client' boundary on the /salaries page (aside from /compare).
// It is intentionally thin: it does no data fetching — all it does is manage
// filter state and keep URL search params in sync so the RSC parent re-renders.
//
// WHY debounce text inputs (400ms):
//   Every change triggers a router.push() which causes a full server re-render.
//   Without debouncing, every keystroke in "company" fires a DB query.
//   400ms lets the user finish typing before we fire.
//
// WHY read from useSearchParams() on mount:
//   Edge case from section 9.2: /salaries?company=amazon&level=L4 must pre-fill
//   the inputs. useSearchParams() gives us the current URL state at render time.

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { LEVEL_ENUM } from '@/lib/constants';
import type { Level } from '@/types';

const SORT_OPTIONS = [
  { value: 'total_comp_desc', label: 'Total TC: High → Low' },
  { value: 'total_comp_asc',  label: 'Total TC: Low → High' },
  { value: 'newest',          label: 'Newest First'          },
] as const;

type SortValue = typeof SORT_OPTIONS[number]['value'];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialise from URL search params so pre-filled filters work (section 9.2)
  const [company,  setCompany]  = useState(searchParams.get('company')  ?? '');
  const [role,     setRole]     = useState(searchParams.get('role')     ?? '');
  const [level,    setLevel]    = useState(searchParams.get('level')    ?? '');
  const [location, setLocation] = useState(searchParams.get('location') ?? '');
  const [sort,     setSort]     = useState<SortValue>(
    (searchParams.get('sort') as SortValue) ?? 'total_comp_desc'
  );

  // Ref to hold the debounce timer so we can cancel it on each new keystroke
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Builds the full query string from current filter state, always resets to page=1
  const buildParams = useCallback(
    (overrides: Partial<{
      company: string;
      role: string;
      level: string;
      location: string;
      sort: SortValue;
    }> = {}) => {
      const params = new URLSearchParams();

      const resolved = {
        company,
        role,
        level,
        location,
        sort,
        ...overrides,
      };

      if (resolved.company.trim())  params.set('company',  resolved.company.trim());
      if (resolved.role.trim())     params.set('role',     resolved.role.trim());
      if (resolved.level)           params.set('level',    resolved.level);
      if (resolved.location.trim()) params.set('location', resolved.location.trim());
      params.set('sort', resolved.sort);
      // Reset to page 1 whenever any filter changes
      params.set('page', '1');

      return params.toString();
    },
    [company, role, level, location, sort]
  );

  // Navigate immediately for select inputs (level, sort) — no debounce needed
  function pushImmediate(overrides: Parameters<typeof buildParams>[0]) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    router.push(`/salaries?${buildParams(overrides)}`);
  }

  // Debounced navigate for text inputs — waits 400ms after last keystroke
  function pushDebounced(overrides: Parameters<typeof buildParams>[0]) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      router.push(`/salaries?${buildParams(overrides)}`);
    }, 400);
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const inputBase =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#222222] shadow-sm ' +
    'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent ' +
    'transition-all hover:border-gray-300';

  return (
    <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">

        {/* Company — debounced text */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-company" className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            Company
          </label>
          <input
            id="filter-company"
            type="text"
            value={company}
            placeholder="e.g. Google"
            className={inputBase}
            onChange={(e) => {
              setCompany(e.target.value);
              pushDebounced({ company: e.target.value });
            }}
          />
        </div>

        {/* Role — debounced text */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-role" className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            Role
          </label>
          <input
            id="filter-role"
            type="text"
            value={role}
            placeholder="e.g. SWE"
            className={inputBase}
            onChange={(e) => {
              setRole(e.target.value);
              pushDebounced({ role: e.target.value });
            }}
          />
        </div>

        {/* Level — immediate select */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-level" className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            Level
          </label>
          <select
            id="filter-level"
            value={level}
            className={inputBase}
            onChange={(e) => {
              setLevel(e.target.value);
              pushImmediate({ level: e.target.value });
            }}
          >
            <option value="">All Levels</option>
            {LEVEL_ENUM.map((l: Level) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Location — debounced text */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-location" className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            Location
          </label>
          <input
            id="filter-location"
            type="text"
            value={location}
            placeholder="e.g. Bengaluru"
            className={inputBase}
            onChange={(e) => {
              setLocation(e.target.value);
              pushDebounced({ location: e.target.value });
            }}
          />
        </div>

        {/* Sort — immediate select */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-sort" className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            Sort By
          </label>
          <select
            id="filter-sort"
            value={sort}
            className={inputBase}
            onChange={(e) => {
              const val = e.target.value as SortValue;
              setSort(val);
              pushImmediate({ sort: val });
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear all filters */}
        <div className="flex flex-col justify-end">
          <a
            href="/salaries"
            onClick={() => {
              setCompany('');
              setRole('');
              setLevel('');
              setLocation('');
              setSort('total_comp_desc');
            }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-center
                       text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-[#FF385C] hover:border-red-100 transition-all shadow-sm"
          >
            Clear
          </a>
        </div>

      </div>
    </div>
  );
}
