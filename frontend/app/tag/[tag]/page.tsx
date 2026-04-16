/**
 * Tag Page
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
    description: `US Stock Story posts tagged #${params.tag}`,
  };
}

export async function generateStaticParams() {
  try {
    const res = await getTags();
    return (res.data || [])
      .filter((tag) => tag.slug && tag.slug.trim() !== '')
      .map((tag) => ({ tag: tag.slug }));
  } catch {
    return [];
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const posts = await fetchTagPosts(params.tag);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="py-12 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-blue-600 dark:text-blue-400">#{params.tag}</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>
      </div>

      {/* Post List */}
      <LatestPostsGrid posts={posts} title={`#${params.tag} Posts`} />
    </div>
  );
}
