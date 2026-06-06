'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSearch() {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');

  const TABS = [
    { name: 'Salaries', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Reviews', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
    { name: 'Interviews', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
    { name: 'Companies', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'Jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (location) params.set('location', location);
    router.push(`/salaries?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Floating Search Container */}
      <div className="bg-white rounded-2xl shadow-xl shadow-red-900/5 overflow-hidden border border-gray-100 mb-8">
        
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 hide-scrollbar">
          {TABS.map((tab, idx) => {
            const isActive = tab.name === 'Salaries';
            return (
              <button
                key={tab.name}
                className={`flex items-center gap-2 px-8 py-5 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                  isActive ? 'text-[#FF385C]' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF385C]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Inputs row */}
        <div className="p-4 flex flex-col md:flex-row items-center gap-4">
          
          {/* Job Title */}
          <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 focus-within:border-[#FF385C] focus-within:ring-1 focus-within:ring-[#FF385C] transition-all">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="flex flex-col flex-1">
              <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">Search by job title, skill or company</span>
              <input
                type="text"
                placeholder="e.g. Software Engineer, Data Analyst"
                className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="flex-[0.8] w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 focus-within:border-[#FF385C] focus-within:ring-1 focus-within:ring-[#FF385C] transition-all">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="flex flex-col flex-1">
              <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">Location</span>
              <input
                type="text"
                placeholder="e.g. New York, India"
                className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Experience */}
          <div className="flex-[0.6] w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 focus-within:border-[#FF385C] focus-within:ring-1 focus-within:ring-[#FF385C] transition-all relative">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div className="flex flex-col flex-1">
              <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">Experience</span>
              <select
                className="w-full text-sm text-gray-900 focus:outline-none bg-transparent appearance-none cursor-pointer"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="" disabled className="text-gray-400">e.g. 0-5 years</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            <svg className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>

          {/* Search Button */}
          <button 
            onClick={handleSearch}
            className="w-full md:w-auto px-8 py-4 bg-[#FF385C] text-white font-bold rounded-xl hover:bg-[#E03150] transition-colors shadow-lg shadow-red-500/20"
          >
            Search
          </button>
        </div>
      </div>

      {/* Trending Searches */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-gray-500 mr-2">Trending searches</span>
        {['Software Engineer', 'Data Scientist', 'Product Manager', 'Marketing Manager', 'Remote Jobs'].map((term) => (
          <button
            key={term}
            onClick={() => { setRole(term); handleSearch(); }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
