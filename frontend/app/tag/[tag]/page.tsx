/**
 * 태그 페이지
 * Dynamic route: /tag/[tag]/
 */

import { Metadata } from 'next';
import { LatestPostsGrid } from '@/components/LatestPostsGrid';
import { getPostsByTag, getTags } from '@/lib/api';

interface TagPageProps {
  params: {
    tag: string;
  };
}

async function fetchTagPosts(tag: string) {
  try {
    const res = await getPostsByTag(tag, { limit: 20 });
    return res.data || [];
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  return {
    title: `#${params.tag} | US Stock Story`,
    description: `US Stock Story의 #${params.tag} 태그 포스트`,
  };
}

export async function generateStaticParams() {
  try {
    const res = await getTags();
    return (res.data || []).map((tag) => ({
      tag: tag.slug,
    }));
  } catch {
    return [];
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const posts = await fetchTagPosts(params.tag);

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="py-12 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-blue-600 dark:text-blue-400">#{params.tag}</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          총 {posts.length}개의 포스트
        </p>
      </div>

      {/* 포스트 목록 */}
      <LatestPostsGrid posts={posts} title={`#${params.tag} 포스트`} />
    </div>
  );
}
