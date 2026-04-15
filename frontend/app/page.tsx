/**
 * 홈 페이지
 * 최신 포스트, 카테고리별 섹션, 실시간 주가 위젯
 */

// 항상 최신 데이터 가져오기 (SSR 모드)
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
      {/* 헤로 섹션 */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          미국 주식, 제대로 분석하기
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          한국 개인 투자자를 위한 미국 주식 시장 분석과 투자 전략을 매일 제공합니다.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/stock-analysis">
            <Button variant="primary" size="lg">
              시작하기
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" size="lg">
              검색하기
            </Button>
          </Link>
        </div>
      </section>


      {/* 최신 포스트 */}
      <Suspense fallback={<LatestPostsGrid posts={[]} isLoading={true} />}>
        <LatestPostsGrid posts={posts.slice(0, 6)} title="최신 분석" />
      </Suspense>

      {/* 카테고리별 섹션 */}
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

      {/* 광고 */}
      <AdUnit slot="9205887899" format="horizontal" />

      {/* 태그 클라우드 */}
      {tags.length > 0 && <TagCloud tags={tags.slice(0, 30)} />}

      {/* 기능 요약 */}
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">US Stock Story의 특징</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'AI 자동 분석',
              desc: 'Claude AI가 작성한 하루 3회 자동 분석 포스트',
              icon: '🤖',
            },
            {
              title: '실시간 시세',
              desc: 'S&P500, NASDAQ 등 주요 지수 실시간 업데이트',
              icon: '⚡',
            },
            {
              title: '한국 투자자 관점',
              desc: '환율, 세금 등 한국 투자자를 위한 맞춤 정보',
              icon: '🇰🇷',
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

      {/* CTA 섹션 */}
      <section className="py-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white px-6 md:px-12">
        <h2 className="text-2xl font-bold mb-4">매일 새로운 분석을 받아보세요</h2>
        <p className="text-blue-100 mb-6 max-w-2xl">
          AI가 작성한 미국 주식 분석을 하루 3회(8시, 14시, 22시)에 자동으로 발행합니다.
        </p>
        <Button variant="secondary" size="lg">
          더 알아보기
        </Button>
      </section>
    </div>
  );
}
