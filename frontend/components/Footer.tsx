/**
 * Footer 컴포넌트
 * 사이트 푸터 (링크, 소셜미디어, 저작권)
 */

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 소개 */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              USStockStory
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              한국 개인 투자자를 위한 미국 주식 분석 블로그
            </p>
          </div>

          {/* 카테고리 */}
          <div>
            <h4 className="font-semibold mb-4">카테고리</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/stock-analysis" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  종목분석
                </Link>
              </li>
              <li>
                <Link href="/market-trend" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  시장동향
                </Link>
              </li>
              <li>
                <Link href="/earnings" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  실적발표
                </Link>
              </li>
              <li>
                <Link href="/etf-analysis" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  ETF분석
                </Link>
              </li>
            </ul>
          </div>

          {/* 링크 */}
          <div>
            <h4 className="font-semibold mb-4">사이트</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  검색
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  관리자
                </Link>
              </li>
            </ul>
          </div>

          {/* 소셜 */}
          <div>
            <h4 className="font-semibold mb-4">소셜</h4>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                title="Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                title="GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 저작권 */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            &copy; {currentYear} <span className="font-semibold">US Stock Story</span>. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
              개인정보 정책
            </a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
              이용약관
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
