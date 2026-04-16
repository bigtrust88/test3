/**
 * TagCloud 컴포넌트
 * 태그 클라우드 (글꼴 크기 조정)
 */

import Link from 'next/link';
import { Tag } from '@/lib/types';

interface TagCloudProps {
  tags: Tag[];
  maxSize?: number;
}

export function TagCloud({ tags, maxSize = 50 }: TagCloudProps) {
  if (tags.length === 0) return null;

  // 최대/최소 포스트 수 계산
  const counts = tags.map((t) => t.post_count);
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);
  const range = maxCount - minCount || 1;

  return (
    <section className="py-8">
      <h3 className="text-lg font-bold mb-6">Tags</h3>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => {
          // 포스트 수에 따른 글꼴 크기 계산
          const normalized = (tag.post_count - minCount) / range;
          const fontSize = 12 + normalized * (maxSize - 12);
          const opacity = 0.6 + normalized * 0.4;

          return (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              style={{ fontSize: `${fontSize}px`, opacity }}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              title={`${tag.post_count} posts`}
            >
              #{tag.name}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
