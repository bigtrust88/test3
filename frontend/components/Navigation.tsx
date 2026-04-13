/**
 * Navigation 컴포넌트
 * 카테고리 드롭다운 네비게이션
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';

interface NavigationProps {
  activeCategory?: string;
}

export function Navigation({ activeCategory }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative hidden md:block">
      <div className="flex items-center gap-1">
        {CATEGORIES.map((category) => (
          <div key={category.slug} className="group relative">
            <Link
              href={`/${category.slug}`}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                transition-colors duration-200
                ${
                  activeCategory === category.slug
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                }
              `}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Link>
          </div>
        ))}
      </div>

      {/* 모바일 메뉴 토글 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-gray-700 dark:text-gray-300"
        aria-label="카테고리 메뉴"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* 모바일 드롭다운 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 md:hidden">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg"
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
