'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Company {
  name: string;
  slug: string;
  salaryCount: number;
}

export default function CompanySearchInput() {
  const [query, setQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/companies')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setCompanies(json.data);
        } else if (Array.isArray(json)) {
          setCompanies(json);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const filtered = companies.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8); // Show max 8 suggestions

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filtered.length > 0) {
      router.push(`/companies/${filtered[0].slug}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative max-w-xl mx-auto shadow-lg shadow-red-100/50 rounded-full z-50">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717171]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Search for a company..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full pl-12 pr-6 py-4 rounded-full border border-gray-100 bg-white text-base text-[#222222] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FF385C] transition-all"
      />
      
      {isOpen && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-80 overflow-y-auto">
          {filtered.length > 0 ? (
            <ul>
              {filtered.map(company => (
                <li key={company.slug}>
                  <Link 
                    href={`/companies/${company.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-red-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <span className="font-semibold text-gray-800">{company.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{company.salaryCount} salaries</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No companies found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
