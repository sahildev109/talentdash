import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="max-w-md w-full">
        <span className="text-8xl font-black text-[#1E3A5F] select-none tracking-tight block animate-pulse">
          404
        </span>
        <h1 className="text-3xl font-extrabold text-[#222222] mt-4 mb-2">
          Page not found
        </h1>
        <p className="text-[#717171] mb-8 leading-relaxed">
          Sorry, we couldn&apos;t find the page you are looking for. It might have been moved, deleted, or never existed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/salaries"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#152943] transition-colors shadow-sm"
          >
            Explore Salaries
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-[#EBEBEB] text-sm font-semibold rounded-lg text-[#222222] bg-white hover:bg-[#F7F7F7] transition-colors shadow-sm"
          >
            Go to Home
          </a>
        </div>
      </div>
    </main>
  );
}
