import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: '%s | TalentDash',
    default: 'TalentDash — Career Intelligence Platform',
  },
  description: 'Career intelligence platform for India tech',
};

import Navbar from '@/components/layout/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-[#222222] min-h-screen antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
