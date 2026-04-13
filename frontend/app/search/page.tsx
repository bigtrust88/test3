/**
 * 검색 페이지
 */

'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LatestPostsGrid } from '@/components/LatestPostsGrid';
import { getPosts } from '@/lib/api';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(!!query);

  useState(async () => {
    if (query) {
      setIsLoading(true);
      try {
        const res = await getPosts({ search: query, limit: 20 });
        setResults(res.data || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="space-y-8">
      {/* 검색 헤더 */}
      <div className="py-12 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-bold mb-4">검색 결과</h1>
        <div className="relative max-w-md">
          <input
            type="text"
            defaultValue={query}
            placeholder="검색어를 입력하세요"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
        {query && (
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            '{query}'에 대한 검색 결과: {results.length}개
          </p>
        )}
      </div>

      {/* 결과 */}
      {query && (
        <Suspense fallback={<LatestPostsGrid posts={[]} isLoading={true} />}>
          <LatestPostsGrid
            posts={results}
            isLoading={isLoading}
            title={`'${query}' 검색 결과`}
          />
        </Suspense>
      )}

      {!query && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>검색어를 입력하여 포스트를 찾으세요.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SearchContent />
    </Suspense>
  );
}
