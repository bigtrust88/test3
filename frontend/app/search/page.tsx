/**
 * Search Page
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
      {/* Search Header */}
      <div className="py-12 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-bold mb-4">Search Results</h1>
        <div className="relative max-w-md">
          <input
            type="text"
            defaultValue={query}
            placeholder="Enter a search term..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
        {query && (
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {results.length} {results.length === 1 ? 'result' : 'results'} for &apos;{query}&apos;
          </p>
        )}
      </div>

      {/* Results */}
      {query && (
        <Suspense fallback={<LatestPostsGrid posts={[]} isLoading={true} />}>
          <LatestPostsGrid
            posts={results}
            isLoading={isLoading}
            title={`Results for '${query}'`}
          />
        </Suspense>
      )}

      {!query && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Enter a search term to find posts.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
