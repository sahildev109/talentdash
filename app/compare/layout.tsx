import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Salaries',
  description: 'Compare two salary records side-by-side at TalentDash.',
  alternates: { canonical: 'https://talentdash.com/compare' },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
