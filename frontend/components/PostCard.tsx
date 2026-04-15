/**
 * PostCard 컴포넌트
 * 포스트 카드 (이미지, 메타데이터)
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/lib/types';
import { Badge } from './ui/Badge';
import clsx from 'clsx';

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export const PostCard = React.forwardRef<HTMLDivElement, PostCardProps>(
  ({ post, featured = false }, ref) => {
    const publishDate = new Date(post.published_at).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return (
      <Link href={`/post/${post.slug}`}>
        <div
          ref={ref}
          className={clsx(
            'group rounded-lg overflow-hidden',
            'bg-white dark:bg-gray-900',
            'border border-gray-200 dark:border-gray-800',
            'hover:border-blue-500 dark:hover:border-blue-500',
            'hover:shadow-lg dark:hover:shadow-lg',
            'transition-all duration-300',
            featured && 'col-span-1 md:col-span-2',
          )}
        >
          {/* 이미지 */}
          <div className={clsx('relative overflow-hidden bg-gray-100 dark:bg-gray-800', featured ? 'h-64' : 'h-40')}>
            {post.cover_image_url ? (
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
                  <circle cx="8.5" cy="9.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>

          {/* 내용 */}
          <div className="p-4">
            {/* 카테고리 */}
            {post.category?.name_ko && (
              <div className="mb-3">
                <Badge variant="primary" size="sm">
                  {post.category.name_ko}
                </Badge>
              </div>
            )}

            {/* 제목 */}
            <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {post.title}
            </h3>

            {/* 설명 */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {post.excerpt}
            </p>

            {/* 메타데이터 */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <time dateTime={post.published_at}>{publishDate}</time>
                <span>•</span>
                <span>{post.reading_time_mins} min read</span>
              </div>

              {post.is_ai_generated && (
                <span className="text-blue-500 dark:text-blue-400 font-medium">🤖 AI</span>
              )}
            </div>

            {/* 태그 */}
            {post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag.id} variant="secondary" size="sm">
                    #{tag.name}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <Badge variant="secondary" size="sm">
                    +{post.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  },
);

PostCard.displayName = 'PostCard';
