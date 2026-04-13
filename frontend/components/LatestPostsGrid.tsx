/**
 * LatestPostsGrid 컴포넌트
 * 포스트 그리드 레이아웃
 */

'use client';

import { Post } from '@/lib/types';
import { PostCard } from './PostCard';
import { Skeleton } from './ui/Skeleton';

interface LatestPostsGridProps {
  posts: Post[];
  isLoading?: boolean;
  title?: string;
}

export function LatestPostsGrid({ posts, isLoading = false, title = '최신 포스트' }: LatestPostsGridProps) {
  return (
    <section className="py-8">
      {title && <h2 className="text-2xl font-bold mb-8">{title}</h2>}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="space-y-3">
              <Skeleton height={160} />
              <Skeleton height={20} width="80%" />
              <Skeleton height={16} count={2} width="100%" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>포스트가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <PostCard
              key={post.id}
              post={post}
              featured={idx === 0 && posts.length > 2}
            />
          ))}
        </div>
      )}
    </section>
  );
}
