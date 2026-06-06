'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { label: 'Explore', href: '/' },
  { label: 'Compare', href: '/compare' },
  { label: 'Salaries', href: '/salaries' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Companies', href: '/companies' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#EBEBEB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#FF385C]">
            <path d="M16 2.66663L2.66663 9.33329V22.6666L16 29.3333L29.3333 22.6666V9.33329L16 2.66663Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 12L10.6666 14.6667V17.3333L16 20L21.3333 17.3333V14.6667L16 12Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[22px] font-bold tracking-tight text-[#222222]">
            TalentDash
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          {LINKS.map((link) => {
            const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== '/');
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative flex items-center h-full text-sm font-semibold transition-colors ${
                  isActive ? 'text-[#FF385C]' : 'text-[#717171] hover:text-[#222222]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FF385C]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section (Search & Sign In) */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex relative items-center">
            <svg
              className="absolute left-3 w-4 h-4 text-[#717171]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search companies, roles, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-72 rounded-full border border-[#EBEBEB] bg-[#F7F7F7] text-sm text-[#222222] placeholder-[#717171] focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:bg-white transition-all shadow-sm"
            />
          </div>
          <button className="px-4 py-2 text-sm font-semibold text-[#222222] border border-[#EBEBEB] rounded-full hover:shadow-md hover:border-[#DDDDDD] transition-all bg-white">
            Sign in
          </button>
        </div>

      </div>
    </header>
  );
}
