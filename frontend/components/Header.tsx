/**
 * Header 컴포넌트
 * Sticky 헤더 (로고, 네비게이션, 검색, 다크모드 토글)
 */

'use client';

import Link from 'next/link';
import { Navigation } from './Navigation';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/Button';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  activeCategory?: string;
}

export function Header({ activeCategory }: HeaderProps) {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400">
            <span className="text-2xl">📈</span>
            <span className="hidden sm:inline">USStockStory</span>
          </Link>

          {/* 검색 바 */}
          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* 우측 액션 */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <Link href="/admin">
                <Button variant="secondary" size="sm">
                  대시보드
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="secondary" size="sm">
                  로그인
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* 네비게이션 */}
        <Navigation activeCategory={activeCategory} />
      </div>
    </header>
  );
}
