/**
 * 카테고리 페이지
 * Dynamic route: /[category]/
 */

// ISR: 5분마다 재검증, 또는 On-demand ISR로 즉시 갱신
export const revalidate = 300;

import { Suspense } from 'react';
import { LatestPostsGrid } from '@/components/LatestPostsGrid';
import { getPostsByCategory } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Metadata } from 'next';
import Link from 'next/link';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

async function fetchCategoryPosts(categorySlug: string) {
  try {
    const res = await getPostsByCategory(categorySlug, { limit: 20 });
    return res.data || [];
  } catch (error) {
    console.error('Failed to fetch category posts:', error);
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = CATEGORIES.find((c) => c.slug === params.category);

  return {
    title: `${category?.name || '카테고리'} | US Stock Story`,
    description: category?.description || `US Stock Story의 ${category?.name} 포스트`,
  };
}

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    category: cat.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = CATEGORIES.find((c) => c.slug === params.category);
  const posts = await fetchCategoryPosts(params.category);

  if (!category) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">카테고리를 찾을 수 없습니다</h1>
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 카테고리 헤더 */}
      <div className="py-12 border-b border-gray-200 dark:border-gray-800">
        <div className="text-4xl mb-4">{category.icon}</div>
        <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400">{category.description}</p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          총 {posts.length}개의 포스트
        </p>
      </div>

      {/* 포스트 목록 */}
      <Suspense fallback={<LatestPostsGrid posts={[]} isLoading={true} />}>
        <LatestPostsGrid posts={posts} title={`${category.name} 분석`} />
      </Suspense>

      {/* 다른 카테고리 링크 */}
      <section className="py-12 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold mb-8">다른 카테고리</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {CATEGORIES.filter((c) => c.slug !== params.category).map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-center"
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div className="font-semibold text-sm">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
