/**
 * Root Layout
 * ThemeProvider wrapper, shared Header and Footer
 */

import React from 'react';
import { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'US Stock Story - US Stock Market Analysis Blog',
  description: 'Daily US stock market analysis, earnings breakdowns, ETF picks, and investment strategies for global investors.',
  authors: [{ name: 'US Stock Story' }],
  keywords: ['US stocks', 'stock analysis', 'investment', 'ETF', 'earnings', 'market trend', 'S&P 500', 'NASDAQ'],
  openGraph: {
    title: 'US Stock Story',
    description: 'US stock market analysis and investment strategies',
    type: 'website',
    locale: 'en_US',
    url: 'https://bigtrust.site',
    siteName: 'US Stock Story',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">{children}</main>

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
