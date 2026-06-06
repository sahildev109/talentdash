'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import CompanyComparePanel, { CompanyCompareResult } from '@/components/features/CompanyComparePanel';
import Image from 'next/image';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [c1, setC1] = useState(searchParams.get('c1') ?? '');
  const [c2, setC2] = useState(searchParams.get('c2') ?? '');
  const [result, setResult] = useState<CompanyCompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companies, setCompanies] = useState<{ slug: string; name: string }[]>([]);

  // Fetch company list for the dropdowns
  useEffect(() => {
    fetch('/api/companies')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setCompanies(json.data);
        } else if (Array.isArray(json)) {
          // Fallback just in case the API format changes
          setCompanies(json);
        }
      })
      .catch(console.error);
  }, []);

  // Sync state to URL
  useEffect(() => {
    if (c1 && c2) {
      router.replace(`/compare?c1=${c1}&c2=${c2}`, { scroll: false });
    }
  }, [c1, c2, router]);

  // Fetch comparison data when both c1 and c2 are set
  useEffect(() => {
    if (!c1 || !c2) {
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/compare-companies?c1=${c1}&c2=${c2}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.message);
          setResult(null);
        } else {
          setResult(data as CompanyCompareResult);
        }
      })
      .catch(() => setError('Failed to load comparison. Please try again.'))
      .finally(() => setLoading(false));
  }, [c1, c2]);

  const handlePopularClick = (slug1: string, slug2: string) => {
    setC1(slug1);
    setC2(slug2);
  };

  const POPULAR = [
    { c1: 'google', c2: 'meta', label: 'Google vs Meta', sub: 'Compensation & Benefits' },
    { c1: 'amazon', c2: 'microsoft', label: 'Amazon vs Microsoft', sub: 'Career Growth' },
    { c1: 'openai', c2: 'anthropic', label: 'OpenAI vs Anthropic', sub: 'Culture & Work-Life' },
    { c1: 'stripe', c2: 'paypal', label: 'Stripe vs PayPal', sub: 'Growth & Stability' },
    { c1: 'tcs', c2: 'infosys', label: 'TCS vs Infosys', sub: 'Salaries & Benefits' },
    { c1: 'apple', c2: 'tesla', label: 'Apple vs Tesla', sub: 'Culture & Work-Life' },
    { c1: 'deloitte', c2: 'pwc', label: 'Deloitte vs PwC', sub: 'Work-Life Balance' },
    { c1: 'nvidia', c2: 'amd', label: 'NVIDIA vs AMD', sub: 'Career Growth' },
  ];

  return (
    <>
      {/* Interactive Picker */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 max-w-2xl mx-auto flex items-center justify-center gap-8 mb-16 relative">
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-2xl bg-red-50 flex items-center justify-center text-red-400 text-4xl border border-red-100 shadow-inner relative overflow-hidden">
            {c1 ? (
              <Image src={`/logos/${c1}.png`} alt={c1} fill className="object-contain p-4" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              '+'
            )}
            {!c1 && <span className="absolute inset-0 flex items-center justify-center text-4xl text-red-400 font-light">+</span>}
          </div>
          <select 
            value={c1} 
            onChange={e => setC1(e.target.value)}
            className="text-sm font-bold text-gray-700 bg-transparent border-none outline-none cursor-pointer text-center hover:text-[#FF385C]"
          >
            <option value="">Select Company</option>
            {companies.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        <span className="text-xl font-black text-gray-800">vs</span>

        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-400 text-4xl border border-blue-100 shadow-inner relative overflow-hidden">
            {c2 ? (
              <Image src={`/logos/${c2}.png`} alt={c2} fill className="object-contain p-4" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              '+'
            )}
            {!c2 && <span className="absolute inset-0 flex items-center justify-center text-4xl text-blue-400 font-light">+</span>}
          </div>
          <select 
            value={c2} 
            onChange={e => setC2(e.target.value)}
            className="text-sm font-bold text-gray-700 bg-transparent border-none outline-none cursor-pointer text-center hover:text-blue-500"
          >
            <option value="">Select Company</option>
            {companies.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Result State */}
      {loading && (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-500 shadow-sm mb-16">
          <div className="w-8 h-8 border-4 border-red-200 border-t-[#FF385C] rounded-full animate-spin mb-4"></div>
          <p className="font-bold">Analyzing comparison data...</p>
        </div>
      )}

      {!loading && error && (
        <div className="max-w-4xl mx-auto bg-red-50 rounded-2xl border border-red-200 p-6 text-red-600 text-center font-medium shadow-sm mb-16">
          {error}
        </div>
      )}

      {!loading && result && (
        <div className="max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-extrabold text-center mb-8">Head-to-Head Analysis</h2>
          <CompanyComparePanel result={result} />
        </div>
      )}

      {/* Popular Comparisons Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="flex justify-between items-end mb-6 px-2">
          <h2 className="text-xl font-extrabold text-[#222222]">Popular comparisons</h2>
          <button className="text-[#FF385C] font-bold text-sm hover:underline flex items-center gap-1">
            View all comparisons &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR.map((pop, i) => (
            <div 
              key={i} 
              onClick={() => handlePopularClick(pop.c1, pop.c2)}
              className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-red-100 hover:shadow-md transition-all group relative overflow-hidden h-40"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 relative">
                  <Image src={`/logos/${pop.c1}.png`} alt={pop.c1} fill className="object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <span className="text-xs font-bold text-gray-400">vs</span>
                <div className="w-10 h-10 relative">
                  <Image src={`/logos/${pop.c2}.png`} alt={pop.c2} fill className="object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
              </div>
              <h3 className="text-sm font-bold text-[#222222] mb-1">{pop.label}</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{pop.sub}</p>

              <div className="absolute right-4 bottom-4 w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 group-hover:text-[#FF385C]">
                &rarr;
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-red-50 to-pink-50 rounded-3xl p-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm text-[#FF385C]">
            ✨
          </div>
          <div>
            <h3 className="font-bold text-[#222222]">Can&apos;t decide which companies to compare?</h3>
            <p className="text-sm text-gray-600 mt-1">Explore top companies or view comparisons by category.</p>
          </div>
        </div>
        <button className="bg-white px-6 py-3 rounded-xl font-bold text-sm text-[#222222] shadow-sm hover:shadow transition-shadow flex items-center gap-2 border border-gray-100">
          Explore companies &rarr;
        </button>
      </div>

    </>
  );
}

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-[#F7F7F7] px-4 pt-16 pb-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#222222] mb-4">
          Compare companies. Make <span className="text-[#FF385C]">better</span> career moves.
        </h1>
        <p className="text-lg text-gray-500 font-medium">
          Compare salaries, benefits, culture, growth and more to find the right workplace for you.
        </p>
      </div>
      
      <Suspense fallback={
        <div className="max-w-4xl mx-auto bg-white rounded-xl border border-[#EBEBEB] p-8 flex items-center justify-center text-[#717171] text-sm shadow-sm">
          Loading...
        </div>
      }>
        <CompareContent />
      </Suspense>
    </main>
  );
}
