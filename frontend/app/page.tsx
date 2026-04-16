/**
 * Home Page
 * Latest posts, category sections, market widget
 */

// Always fetch fresh data (SSR mode)
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { AdUnit } from '@/components/AdUnit';
import { LatestPostsGrid } from '@/components/LatestPostsGrid';
import { CategorySection } from '@/components/CategorySection';
import { TagCloud } from '@/components/TagCloud';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { getPosts, getCategories, getTags } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';

async function fetchData() {
  const [postsRes, categoriesRes, tagsRes] = await Promise.allSettled([
    getPosts({ limit: 20 }),
    getCategories(),
    getTags(),
  ]);

  return {
    posts: postsRes.status === 'fulfilled' ? (postsRes.value?.data || []) : [],
    categories: categoriesRes.status === 'fulfilled' ? (categoriesRes.value?.data || []) : [],
    tags: tagsRes.status === 'fulfilled' ? (tagsRes.value?.data || []) : [],
  };
}

export default async function Home() {
  const { posts, categories, tags } = await fetchData();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          US Stock Market, Analyzed Daily
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          In-depth US stock analysis, earnings breakdowns, ETF picks, and investment strategies — updated every day.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/stock-analysis">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" size="lg">
              Search Posts
            </Button>
          </Link>
        </div>
      </section>

      {/* Latest Posts */}
      <Suspense fallback={<LatestPostsGrid posts={[]} isLoading={true} />}>
        <LatestPostsGrid posts={posts.slice(0, 6)} title="Latest Analysis" />
      </Suspense>

      {/* Category Sections */}
      {categories.length > 0 && (
        <div className="space-y-12">
          {categories.slice(0, 5).map((category) => {
            const categoryPosts = posts.filter((p) => p.category?.id === category.id);
            return (
              <CategorySection
                key={category.id}
                category={category}
                posts={categoryPosts.slice(0, 3)}
              />
            );
          })}
        </div>
      )}

      {/* Ad */}
      <AdUnit slot="9205887899" format="horizontal" />

      {/* Tag Cloud */}
      {tags.length > 0 && <TagCloud tags={tags.slice(0, 30)} />}

      {/* Features */}
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Why US Stock Story?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'AI-Powered Analysis',
              desc: 'Daily stock analysis powered by Claude AI — published 3 times a day',
              icon: '🤖',
            },
            {
              title: 'Real-Time Data',
              desc: 'Live updates on S&P 500, NASDAQ, and major indices',
              icon: '⚡',
            },
            {
              title: 'Earnings Coverage',
              desc: 'Comprehensive earnings breakdowns with forward guidance analysis',
              icon: '📊',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-700 dark:text-gray-300">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white px-6 md:px-12">
        <h2 className="text-2xl font-bold mb-4">Stay Ahead of the Market</h2>
        <p className="text-blue-100 mb-6 max-w-2xl">
          AI-generated US stock analysis published 3 times daily — premarket, midday, and closing recap.
        </p>
        <Button variant="secondary" size="lg">
          Learn More
        </Button>
      </section>
    </div>
  );
}
