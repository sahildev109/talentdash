import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { generateCompanyPageMetadata } from '@/lib/metadata';
import { buildCompanyJsonLd } from '@/lib/jsonld';
import Image from 'next/image';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateStaticParams() {
  try {
    const companies = await prisma.company.findMany({ select: { slug: true } });
    return companies.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      salaries: { select: { total_compensation: true } },
    },
  });

  if (!company) return {};

  const tcs = company.salaries.map((s) => Number(s.total_compensation)).sort((a, b) => a - b);
  const mid = Math.floor(tcs.length / 2);
  const median = tcs.length === 0 ? 0 : tcs.length % 2 === 0 ? (tcs[mid - 1] + tcs[mid]) / 2 : tcs[mid];

  return generateCompanyPageMetadata(company.name, slug, median);
}

// Helpers for data aggregation
function getRoleStats(salaries: any[]) {
  const roleCounts: Record<string, { count: number; totalComp: number[] }> = {};
  salaries.forEach((s) => {
    if (!roleCounts[s.role]) {
      roleCounts[s.role] = { count: 0, totalComp: [] };
    }
    roleCounts[s.role].count++;
    roleCounts[s.role].totalComp.push(Number(s.total_compensation));
  });

  const roles = Object.keys(roleCounts).map((role) => {
    const sorted = roleCounts[role].totalComp.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length === 0 ? 0 : sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    return {
      role,
      count: roleCounts[role].count,
      median,
    };
  });

  // Sort by count descending
  return roles.sort((a, b) => b.count - a.count);
}

function formatLPA(val: number) {
  if (val === 0) return '-';
  const lpa = val / 100000;
  return `₹${lpa % 1 === 0 ? lpa : lpa.toFixed(1)}L`;
}

export default async function CompanyPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      salaries: {
        orderBy: { total_compensation: 'desc' },
      },
    },
  });

  if (!company) {
    notFound();
  }

  const roleStats = getRoleStats(company.salaries);

  // Mock data tailored for Google (or generic if not Google)
  const isGoogle = slug === 'google';
  const hq = isGoogle ? 'Mountain View, California' : 'Global Headquarters';
  const desc = isGoogle 
    ? "Google's mission is to organize the world's information and make it universally accessible and useful."
    : `Explore verified salary and culture data for ${company.name}.`;
  
  const products = isGoogle 
    ? [
        { name: 'Search', icon: '🔍', color: 'text-blue-500' },
        { name: 'YouTube', icon: '▶️', color: 'text-red-500' },
        { name: 'Android', icon: '🤖', color: 'text-green-500' },
        { name: 'Google Cloud', icon: '☁️', color: 'text-blue-400' },
        { name: 'Gmail', icon: '✉️', color: 'text-red-400' },
        { name: 'Maps', icon: '📍', color: 'text-green-600' },
      ]
    : [
        { name: 'Core Product', icon: '📦', color: 'text-gray-500' },
        { name: 'Services', icon: '🛠️', color: 'text-gray-500' },
        { name: 'Cloud', icon: '☁️', color: 'text-gray-500' },
      ];

  const tcs = company.salaries.map((s) => Number(s.total_compensation)).sort((a, b) => a - b);
  const mid = Math.floor(tcs.length / 2);
  const median = tcs.length === 0 ? 0 : tcs.length % 2 === 0 ? (tcs[mid - 1] + tcs[mid]) / 2 : tcs[mid];

  const logoPath = path.join(process.cwd(), 'public', 'logos', `${slug}.png`);
  const hasLogo = fs.existsSync(logoPath);

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      {/* 1. Hero Section */}
      <div className="bg-white">
        {/* Banner Image Placeholder */}
        <div className="h-[280px] w-full bg-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          
          <div className="absolute bottom-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between">
              
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-lg shrink-0 border border-white/20">
                  <div className="w-full h-full relative">
                    {hasLogo ? (
                      <Image src={`/logos/${slug}.png`} alt={company.name} fill className="object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-gray-400 bg-gray-50 rounded-xl">
                        {company.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-white pb-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">{company.name}</h1>
                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Verified
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                    Internet • Cloud • AI • Advertising
                  </div>
                  <p className="text-sm text-slate-200 max-w-xl mb-4 leading-relaxed line-clamp-2">
                    {desc}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
                    <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{hq}</span>
                    <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>180K+ employees</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-2">
                <button className="px-5 py-2.5 bg-white text-slate-900 font-bold text-sm rounded-lg hover:bg-slate-100 transition-colors shadow-sm">Follow</button>
                <button className="px-5 py-2.5 bg-white text-slate-900 font-bold text-sm rounded-lg hover:bg-slate-100 transition-colors shadow-sm">Compare</button>
                <button className="px-5 py-2.5 bg-[#FF385C] text-white font-bold text-sm rounded-lg hover:bg-[#E03150] transition-colors shadow-sm">Write a Review</button>
              </div>

            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto hide-scrollbar gap-8">
              {['Overview', 'Reviews', 'Salaries', 'Benefits', 'Jobs', 'Interviews', 'Q&A'].map((tab) => (
                <button key={tab} className={`py-4 text-sm font-bold whitespace-nowrap relative ${tab === 'Overview' ? 'text-[#FF385C]' : 'text-gray-500 hover:text-gray-900'}`}>
                  {tab}
                  {tab === 'Overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF385C]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* 2. At a glance */}
        <section>
          <h2 className="text-xl font-extrabold text-[#222222] mb-6">At a glance</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 grid grid-cols-2 md:grid-cols-6 gap-6 shadow-sm">
            <GlanceItem icon="📅" label="Founded" value="1998" />
            <GlanceItem icon="👥" label="Employees" value="180K+" />
            <GlanceItem icon="📈" label="Revenue" value="$305.6B" sub="(2023)" />
            <GlanceItem icon="🏢" label="Industry" value="Internet Software" />
            <GlanceItem icon="📍" label="Headquarters" value={hq} />
            <GlanceItem icon="🌐" label="Website" value={`${company.slug}.com`} isLink />
          </div>
          <button className="mt-4 text-[#FF385C] font-bold text-sm flex items-center gap-2 hover:underline">View full profile &rarr;</button>
        </section>

        {/* 3. What [Company] does */}
        <section>
          <div className="flex flex-col lg:flex-row gap-12 bg-white rounded-2xl border border-gray-100 p-10 shadow-sm">
            <div className="lg:w-1/3">
              <h2 className="text-xl font-extrabold text-[#222222] mb-4">What {company.name} does</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                From Search to YouTube, Android to Cloud — {company.name}&apos;s products and platforms power billions of interactions every day.
              </p>
            </div>
            <div className="lg:w-2/3 flex flex-col justify-center">
              <div className="flex gap-8 overflow-x-auto hide-scrollbar pb-4">
                {products.map(p => (
                  <div key={p.name} className="flex flex-col items-center gap-3 min-w-[80px]">
                    <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-2xl shadow-sm border border-gray-100">{p.icon}</div>
                    <span className="text-xs font-bold text-gray-700 text-center">{p.name}</span>
                  </div>
                ))}
              </div>
              <div className="text-right mt-2">
                <button className="text-[#FF385C] font-bold text-sm hover:underline">View all products &rarr;</button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Three Column Middle */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Culture */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col">
            <h2 className="text-lg font-extrabold text-[#222222] mb-6">Culture snapshot</h2>
            <div className="space-y-6 mb-8 flex-1">
              <CultureItem title="Innovation" desc="Solve big problems and challenge the status quo" />
              <CultureItem title="User first" desc="Focus on making things helpful and accessible" />
              <CultureItem title="Collaboration" desc="Work together across teams and borders" />
              <CultureItem title="Learning" desc="Grow your skills and help others do the same" />
            </div>
            <div className="bg-red-50 rounded-xl p-5 border border-red-100">
              <h3 className="font-bold text-[#222222] text-sm mb-1">Explore how we work</h3>
              <p className="text-xs text-gray-600 mb-3">Discover {company.name}&apos;s culture, values and ways of working.</p>
              <button className="text-[#FF385C] font-bold text-xs hover:underline">Learn more &rarr;</button>
            </div>
          </div>

          {/* Why choose */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col">
            <h2 className="text-lg font-extrabold text-[#222222] mb-6">Why people choose {company.name}</h2>
            <div className="space-y-4 mb-6 flex-1">
              {['Work on products used by billions', 'Competitive compensation and benefits', 'Opportunities to learn and grow', 'Inclusive and supportive culture', 'Flexibility to balance work and life'].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-sm font-medium text-gray-700 leading-snug">{item}</span>
                </div>
              ))}
            </div>
            {/* Video Placeholder */}
            <div className="w-full h-40 bg-gray-900 rounded-xl relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 opacity-60 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-lg">
                  <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6V4z" /></svg>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <span className="font-bold text-sm block">Life at {company.name}</span>
                <span className="text-xs text-gray-300">Hear from employees around the world</span>
              </div>
            </div>
          </div>

          {/* Updates */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col">
            <h2 className="text-lg font-extrabold text-[#222222] mb-6">Latest updates</h2>
            <div className="space-y-6 flex-1">
              <UpdateItem title="Cloud Next 2024 highlights" desc="See how we're transforming the future of AI and the cloud." />
              <UpdateItem title="Thoughts on the future of AI" desc="CEO shares his thoughts on AI and innovation." />
              <UpdateItem title="Our commitment to sustainability" desc="How we're building a more sustainable future for everyone." />
            </div>
            <button className="text-[#FF385C] font-bold text-sm hover:underline mt-4">View all news &rarr;</button>
          </div>
        </section>

        {/* 5. Benefits */}
        <section>
          <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm flex flex-col lg:flex-row gap-10">
            <div className="lg:w-1/4">
              <h2 className="text-xl font-extrabold text-[#222222] mb-4">Benefits & perks</h2>
              <p className="text-gray-600 text-sm mb-6">Our benefits are designed to support your health, well-being and financial future.</p>
              <button className="text-[#FF385C] font-bold text-sm hover:underline">View all benefits &rarr;</button>
            </div>
            <div className="lg:w-3/4 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { n: 'Health & Wellness', i: '❤️' },
                { n: 'Learning & Development', i: '📚' },
                { n: 'Parental Support', i: '👶' },
                { n: 'Flexible Work', i: '🏠' },
                { n: 'Stock Options', i: '📈' },
                { n: 'Retirement Plans', i: '🏦' },
                { n: 'Meals & Snacks', i: '🥗' },
                { n: 'Commuter Benefits', i: '🚗' },
              ].map(b => (
                <div key={b.n} className="flex flex-col items-center text-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                  <div className="text-2xl">{b.i}</div>
                  <span className="text-xs font-bold text-[#222222] leading-tight">{b.n}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Bottom Insights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Popular Roles */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col">
            <h2 className="text-lg font-extrabold text-[#222222] mb-6">Popular roles</h2>
            <div className="space-y-4 flex-1">
              {roleStats.slice(0, 5).map(r => (
                <div key={r.role} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                  <span className="font-bold text-gray-700">{r.role}</span>
                  <span className="text-gray-500 font-medium">{r.count} salaries</span>
                </div>
              ))}
            </div>
            <button className="text-[#FF385C] font-bold text-sm hover:underline mt-6">View all roles &rarr;</button>
          </div>

          {/* Salary Insights */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col md:col-span-2">
            <h2 className="text-lg font-extrabold text-[#222222] mb-2">Salary insights</h2>
            <p className="text-gray-500 text-sm mb-6">See what professionals are earning in top roles.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
              {roleStats.slice(0, 4).map(r => (
                <div key={r.role} className="border border-gray-100 rounded-xl p-5 hover:border-red-100 hover:shadow-md transition-all group">
                  <h3 className="text-xs font-bold text-gray-700 mb-4 h-8">{r.role}</h3>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-2xl font-extrabold text-[#222222] group-hover:text-[#FF385C] transition-colors">{formatLPA(r.median)}</span>
                    <span className="text-xs text-gray-400 font-medium mb-1">/yr</span>
                  </div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Median total pay</span>
                </div>
              ))}
            </div>
            <button className="text-[#FF385C] font-bold text-sm hover:underline mt-6">View all salaries &rarr;</button>
          </div>

        </section>

      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildCompanyJsonLd(company, median)),
        }}
      />
    </main>
  );
}

// Subcomponents
function GlanceItem({ icon, label, value, sub, isLink }: { icon: string, label: string, value: string, sub?: string, isLink?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <div className="text-xl mb-1">{icon}</div>
      <span className="text-xs text-gray-500 font-semibold">{label}</span>
      <span className={`text-sm font-extrabold ${isLink ? 'text-blue-600 hover:underline cursor-pointer' : 'text-[#222222]'}`}>
        {value}
        {sub && <span className="text-xs text-gray-400 ml-1">{sub}</span>}
      </span>
    </div>
  );
}

function CultureItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">✨</div>
      <div>
        <h4 className="font-bold text-[#222222] text-sm">{title}</h4>
        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function UpdateItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 bg-gray-50">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <div>
        <h4 className="font-bold text-[#222222] text-sm">{title}</h4>
        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
