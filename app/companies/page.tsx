import Link from 'next/link';
import CompanySearchInput from '@/components/features/CompanySearchInput';

export const metadata = {
  title: 'Companies',
  description: 'Search top tech companies and explore verified salaries, levels, and benefits.',
};

const POPULAR_COMPANIES = [
  { name: 'Google', slug: 'google', logo: '/logos/google.png', initial: 'G', color: 'text-blue-500' },
  { name: 'Amazon', slug: 'amazon', logo: '/logos/amazon.png', initial: 'a', color: 'text-orange-500' },
  { name: 'Apple', slug: 'apple', logo: '/logos/apple.png', initial: 'A', color: 'text-slate-800' },
  { name: 'Microsoft', slug: 'microsoft', logo: '/logos/microsoft.png', initial: 'M', color: 'text-green-600' },
  { name: 'Meta', slug: 'meta', logo: '/logos/meta.png', initial: 'M', color: 'text-blue-600' },
  { name: 'Netflix', slug: 'netflix', logo: '/logos/netflix.png', initial: 'N', color: 'text-red-600' },
  { name: 'Tesla', slug: 'tesla', logo: '/logos/tesla.png', initial: 'T', color: 'text-red-500' },
  { name: 'Adobe', slug: 'adobe', logo: '/logos/adobe.png', initial: 'A', color: 'text-red-600' },
  { name: 'Salesforce', slug: 'salesforce', logo: '/logos/salesforce.png', initial: 'S', color: 'text-blue-400' },
  { name: 'Infosys', slug: 'infosys', logo: '/logos/infosys.png', initial: 'I', color: 'text-blue-800' },
  { name: 'TCS', slug: 'tata-consultancy-services', logo: '/logos/tcs.png', initial: 'T', color: 'text-red-500' },
  { name: 'IBM', slug: 'ibm', logo: '/logos/ibm.png', initial: 'I', color: 'text-blue-600' },
  { name: 'Oracle', slug: 'oracle', logo: '/logos/oracle.png', initial: 'O', color: 'text-red-600' },
  { name: 'SAP', slug: 'sap', logo: '/logos/sap.png', initial: 'S', color: 'text-blue-600' },
  { name: 'HCLTech', slug: 'hcltech', logo: '/logos/hcltech.png', initial: 'H', color: 'text-blue-600' },
];

const AI_COMPANIES = [
  { name: 'OpenAI', slug: 'openai', initial: 'O' },
  { name: 'NVIDIA', slug: 'nvidia', initial: 'N' },
  { name: 'Anthropic', slug: 'anthropic', initial: 'A' },
  { name: 'Google DeepMind', slug: 'google-deepmind', initial: 'G' },
  { name: 'Microsoft AI', slug: 'microsoft-ai', initial: 'M' },
  { name: 'Perplexity AI', slug: 'perplexity', initial: 'P' },
  { name: 'Databricks', slug: 'databricks', initial: 'D' },
  { name: 'Cohere', slug: 'cohere', initial: 'C' },
  { name: 'Hugging Face', slug: 'hugging-face', initial: 'H' },
  { name: 'Stability AI', slug: 'stability-ai', initial: 'S' },
  { name: 'Mistral AI', slug: 'mistral-ai', initial: 'M' },
  { name: 'Midjourney', slug: 'midjourney', initial: 'M' },
];

const FUNDING_STAGES = [
  { label: 'Pre-Seed', icon: '🛡️' },
  { label: 'Seed', icon: '🌱' },
  { label: 'Series A', icon: '📈' },
  { label: 'Series B', icon: '🏦' },
  { label: 'Series C', icon: '🚀' },
  { label: 'Series D', icon: '🦄' },
  { label: 'Series E+', icon: '💎' },
  { label: 'Post IPO', icon: '📊' },
];

export default function CompaniesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 flex flex-col items-center justify-center bg-gradient-to-b from-red-50/50 to-white relative overflow-hidden">
        {/* Abstract background blobs could go here */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute top-10 left-10 w-48 h-48 bg-purple-50 rounded-full blur-3xl opacity-50" />

        <div className="z-10 text-center max-w-2xl mx-auto w-full">
          <div className="inline-block px-3 py-1 bg-red-50 text-[#FF385C] text-xs font-bold tracking-wider uppercase rounded-full mb-6">
            Companies
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#222222] mb-4 tracking-tight">
            Search for <span className="text-[#FF385C]">Company</span>
          </h1>
          <p className="text-[#717171] text-lg mb-8">
            Search companies to explore salaries, benefits, and more.
          </p>

          <CompanySearchInput />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Popular Companies */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#222222]">Popular Companies</h2>
            <Link href="/companies/all" className="text-sm font-bold text-[#FF385C] hover:underline flex items-center gap-1">
              View all companies <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {POPULAR_COMPANIES.map((company) => (
              <Link
                key={company.slug}
                href={`/companies/${company.slug}`}
                className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center font-bold text-lg ${company.color || 'text-gray-700'}`}>
                    {company.initial}
                  </div>
                  <span className="font-semibold text-sm text-[#222222] group-hover:text-[#FF385C] transition-colors">
                    {company.name}
                  </span>
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-[#FF385C] transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Startups by Funding Stage */}
        <section className="mb-16">
          <h2 className="text-lg font-bold text-[#222222] mb-6">Startups by Funding Stage</h2>
          <div className="flex flex-wrap gap-4">
            {FUNDING_STAGES.map((stage) => (
              <button
                key={stage.label}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all font-semibold text-sm text-[#222222]"
              >
                <span className="text-lg">{stage.icon}</span>
                {stage.label}
              </button>
            ))}
          </div>
        </section>

        {/* Top AI Companies */}
        <section className="mb-16">
          <h2 className="text-lg font-bold text-[#222222] mb-6">Top AI Companies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {AI_COMPANIES.map((company) => (
              <Link
                key={company.slug}
                href={`/companies/${company.slug}`}
                className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center font-bold text-gray-800">
                    {company.initial}
                  </div>
                  <span className="font-semibold text-xs text-[#222222] group-hover:text-blue-600 transition-colors">
                    {company.name}
                  </span>
                </div>
                <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="bg-red-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left">
          <span className="text-[#FF385C] text-xl">✨</span>
          <span className="text-[#222222] font-medium text-sm">
            <strong>Not sure where to start?</strong> Check out our <Link href="/companies/highest-paying" className="text-[#FF385C] font-bold hover:underline">Top 50 highest paying companies in India.</Link> &rarr;
          </span>
        </div>

      </div>
    </main>
  );
}
