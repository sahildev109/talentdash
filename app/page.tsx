import Link from 'next/link';
import HeroSearch from '@/components/features/HeroSearch';
import Image from 'next/image';

export const revalidate = 3600;

export const metadata = {
  title: 'Career Intelligence for India Tech',
  description: 'Career intelligence platform for India tech',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F7F7F7] pb-24">
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        {/* Abstract Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-50 via-white to-white rounded-full blur-3xl opacity-80 -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-50/50 via-transparent to-transparent rounded-full blur-2xl opacity-60 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-start justify-between gap-12">
          
          <div className="flex-1 w-full pt-10">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 text-[#222222]">
              Explore. Compare. <span className="text-[#FF385C]">Grow.</span>
            </h1>
            <p className="text-xl text-[#717171] font-medium max-w-2xl mb-12 leading-relaxed">
              Discover real salary insights, read reviews, prepare for interviews,
              and find the right opportunities — all in one place.
            </p>

            <HeroSearch />
          </div>

          {/* Placeholder for the 3D Illustration */}
          <div className="hidden lg:flex w-[500px] h-[400px] items-center justify-center relative">
             {/* Using abstract shapes to represent the aesthetic of the illustration */}
             <div className="w-full h-full relative z-10 bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-[3rem] shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-red-100/50 to-transparent" />
                <span className="text-red-200 font-bold text-2xl z-10">Illustration Area</span>
             </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-wrap justify-between items-center gap-6">
          <StatItem icon="📈" value="12M+" label="Salaries" color="bg-red-50 text-red-500" />
          <div className="w-px h-12 bg-gray-100 hidden md:block" />
          <StatItem icon="⭐" value="4.8M+" label="Reviews" color="bg-orange-50 text-orange-500" />
          <div className="w-px h-12 bg-gray-100 hidden md:block" />
          <StatItem icon="🏢" value="950K+" label="Companies" color="bg-red-50 text-[#FF385C]" />
          <div className="w-px h-12 bg-gray-100 hidden md:block" />
          <StatItem icon="🎯" value="210K+" label="Interviews" color="bg-pink-50 text-pink-500" />
          <div className="w-px h-12 bg-gray-100 hidden md:block" />
          <StatItem icon="👥" value="120K+" label="Active Community" color="bg-purple-50 text-purple-500" />
        </div>
      </section>

      {/* 3. Trust Signals Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <TrustItem icon="shield" title="Verified & Trusted" subtitle="Real data. Real people." />
          <TrustItem icon="users" title="10M+ Users" subtitle="Across the globe" />
          <TrustItem icon="building" title="500K+ Companies" subtitle="Researched & reviewed" />
          <TrustItem icon="lock" title="100% Free" subtitle="No hidden charges" />
        </div>
      </section>

      {/* 4. Intelligence Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Intelligence Hub</h2>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Compensation Intelligence */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#FF385C]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-bold text-[#222222] text-lg">Compensation Intelligence</h3>
            </div>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Explore real salary data and compensation trends across roles, companies and cities.
            </p>
            
            <div className="mt-auto">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Average salary in India</span>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-extrabold text-[#222222]">₹28.4</span>
                <span className="text-lg font-bold text-gray-600 mb-1">LPA</span>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md mb-6">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                18% <span className="text-gray-500 font-medium">vs last year</span>
              </span>

              {/* CSS Gradient Chart Mockup */}
              <div className="w-full h-32 relative flex items-end">
                 <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible preserve-aspect-ratio-none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF385C" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#FF385C" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,40 L0,35 L10,32 L20,34 L30,28 L40,29 L50,22 L60,25 L70,15 L80,18 L90,8 L100,2 L100,40 Z" fill="url(#chartGradient)" />
                    <path d="M0,35 L10,32 L20,34 L30,28 L40,29 L50,22 L60,25 L70,15 L80,18 L90,8 L100,2" fill="none" stroke="#FF385C" strokeWidth="1.5" />
                    <circle cx="100" cy="2" r="2.5" fill="white" stroke="#FF385C" strokeWidth="1.5" />
                    <circle cx="90" cy="8" r="2" fill="white" stroke="#FF385C" strokeWidth="1.5" />
                    <circle cx="70" cy="15" r="2" fill="white" stroke="#FF385C" strokeWidth="1.5" />
                 </svg>
                 <div className="absolute bottom-[-20px] w-full flex justify-between text-[10px] font-semibold text-gray-400">
                   <span>2021</span><span>2022</span><span>2023</span><span>2024</span><span>2025</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Card 2: Company Reviews */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </div>
              <h3 className="font-bold text-[#222222] text-lg">Company Reviews & Culture</h3>
            </div>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Read honest reviews and discover what employees really think.
            </p>
            
            <div className="flex items-center justify-between mb-8">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-3xl font-extrabold text-orange-500">4.2</span>
                     <div className="flex text-orange-500">
                        {'★★★★'.split('').map((s, i) => <span key={i} className="text-sm">{s}</span>)}
                        <span className="text-gray-300 text-sm">★</span>
                     </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Based on 4.8M reviews</span>
               </div>
               <div className="text-right">
                 <span className="text-2xl font-extrabold text-[#222222] block mb-1">72%</span>
                 <span className="text-xs text-gray-400 font-medium">Recommend to a friend</span>
               </div>
            </div>

            <div className="mt-auto">
               <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 block">Top rated companies</span>
               <div className="flex items-center gap-4 mb-6">
                  {['google', 'microsoft', 'apple', 'amazon'].map(slug => (
                    <div key={slug} className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-white shadow-sm overflow-hidden">
                       <Image src={`/logos/${slug}.png`} alt={slug} width={24} height={24} className="object-contain" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-gray-100 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
               </div>
               <Link href="/companies" className="text-[#FF385C] font-bold text-sm flex items-center gap-2 hover:underline">
                  Explore companies &rarr;
               </Link>
            </div>
          </div>

          {/* Card 3: Interview Experiences */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h3 className="font-bold text-[#222222] text-lg">Interview Experiences</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Practice real interview questions shared by candidates.
            </p>
            
            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 mb-6 relative overflow-hidden">
               <h4 className="text-purple-700 font-bold text-sm mb-1">Most in-demand skills</h4>
               <span className="text-xs text-gray-500 font-medium">Based on interview trends</span>
               
               {/* Small purple sparkline */}
               <svg viewBox="0 0 100 30" className="absolute right-4 bottom-4 w-24 h-8 overflow-visible">
                 <path d="M0,25 L15,20 L30,22 L45,15 L60,18 L75,10 L90,12 L100,5" fill="none" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                 <circle cx="100" cy="5" r="3" fill="white" stroke="#9333EA" strokeWidth="2" />
               </svg>
            </div>

            <div className="mt-auto">
               <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Top interview roles</span>
               <div className="flex flex-wrap gap-2 mb-8">
                  <span className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-700">Software Engineer</span>
                  <span className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-700">Product Manager</span>
               </div>

               <Link href="/" className="text-purple-600 font-bold text-sm flex items-center gap-2 hover:underline">
                  Explore interviews &rarr;
               </Link>
            </div>
          </div>
          
        </div>
      </section>

    </main>
  );
}

// Subcomponents for Ribbons
function StatItem({ icon, value, label, color }: { icon: string, value: string, label: string, color: string }) {
  return (
    <div className="flex flex-col items-center flex-1 text-center min-w-[120px]">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-3 ${color}`}>
        {icon}
      </div>
      <span className="text-2xl font-extrabold text-[#222222] mb-1">{value}</span>
      <span className="text-sm font-semibold text-gray-500">{label}</span>
    </div>
  );
}

function TrustItem({ icon, title, subtitle }: { icon: string, title: string, subtitle: string }) {
  const getIcon = () => {
    switch (icon) {
      case 'shield': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />;
      case 'users': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />;
      case 'building': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />;
      case 'lock': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />;
      default: return null;
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {getIcon()}
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-[#222222]">{title}</span>
        <span className="text-[13px] font-medium text-gray-500">{subtitle}</span>
      </div>
    </div>
  );
}
