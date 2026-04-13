/**
 * 루트 레이아웃
 * ThemeProvider 래핑, Header, Footer 공유
 */

import React from 'react';
import { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'US Stock Story - 미국주식 분석 블로그',
  description: '한국 개인 투자자를 위한 미국 주식 시장 분석과 투자 전략',
  authors: [{ name: 'US Stock Story' }],
  keywords: ['미국주식', '투자', '분석', '마켓', '주가'],
  openGraph: {
    title: 'US Stock Story',
    description: '미국 주식 분석 및 투자 전략',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://usstockstory.com',
    siteName: 'US Stock Story',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3811219422484638"
          crossOrigin="anonymous"
        />

        {/* Google Analytics (선택사항) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `,
          }}
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
