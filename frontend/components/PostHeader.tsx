/**
 * PostHeader 컴포넌트
 * 포스트 상세 헤더 (이미지, 제목, 메타데이터)
 */

import { Post } from '@/lib/types';
import { Badge } from './ui/Badge';

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  const publishDate = new Date(post.published_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 mb-8">
      {/* 카테고리 + AI 뱃지 */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="primary">{post.category.name_ko}</Badge>
        {post.is_ai_generated && (
          <Badge variant="success">🤖 AI 생성</Badge>
        )}
      </div>

      {/* 제목 */}
      <h1 className="text-4xl md:text-5xl font-bold leading-tight">
        {post.title}
      </h1>

      {/* 요약 */}
      {post.excerpt && (
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {post.excerpt}
        </p>
      )}

      {/* 메타데이터 */}
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
        <time dateTime={post.published_at}>{publishDate}</time>
        <span>•</span>
        <span>{post.reading_time_mins} min read</span>
        {post.author && (
          <>
            <span>•</span>
            <span>By {post.author.display_name}</span>
          </>
        )}
      </div>

      {/* 태그 */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" size="sm">
              #{tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* 커버 이미지는 PostContent 상단에 표시됨 */}
    </div>
  );
}
