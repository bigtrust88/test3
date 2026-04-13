/**
 * CategorySection 컴포넌트
 * 카테고리별 포스트 섹션
 */

import Link from 'next/link';
import { Category, Post } from '@/lib/types';
import { PostCard } from './PostCard';

interface CategorySectionProps {
  category: Category;
  posts: Post[];
}

export function CategorySection({ category, posts }: CategorySectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-12 border-t border-gray-200 dark:border-gray-800">
      <div className="mb-8">
        <Link href={`/${category.slug}`}>
          <h2 className="text-2xl font-bold mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {category.name_ko}
          </h2>
        </Link>
        {category.description && (
          <p className="text-gray-600 dark:text-gray-400">{category.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {posts.slice(0, 3).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <Link href={`/${category.slug}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
        모든 {category.name_ko} 보기 →
      </Link>
    </section>
  );
}
