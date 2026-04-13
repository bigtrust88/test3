/**
 * RelatedPosts 컴포넌트
 * 관련 포스트 (같은 카테고리)
 */

import { Post } from '@/lib/types';
import { PostCard } from './PostCard';

interface RelatedPostsProps {
  posts: Post[];
  currentPostId: string;
  title?: string;
}

export function RelatedPosts({
  posts,
  currentPostId,
  title = '관련 포스트',
}: RelatedPostsProps) {
  const filtered = posts.filter((p) => p.id !== currentPostId).slice(0, 3);

  if (filtered.length === 0) return null;

  return (
    <section className="py-12 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
