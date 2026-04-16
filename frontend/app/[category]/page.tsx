/**
 * Category Page
 * Dynamic route: /[category]/
 */

export const dynamic = 'force-dynamic';

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
    title: `${category?.name || 'Category'} | US Stock Story`,
    description: category?.description || `US Stock Story ${category?.name} posts`,
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
        <h1 className="text-3xl font-bold mb-4">Category not found</h1>
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Header */}
      <div className="py-12 border-b border-gray-200 dark:border-gray-800">
        <div className="text-4xl mb-4">{category.icon}</div>
        <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400">{category.description}</p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>
      </div>

      {/* Post List */}
      <Suspense fallback={<LatestPostsGrid posts={[]} isLoading={true} />}>
        <LatestPostsGrid posts={posts} title={`${category.name} Analysis`} />
      </Suspense>

      {/* Other Categories */}
      <section className="py-12 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold mb-8">Other Categories</h2>
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
