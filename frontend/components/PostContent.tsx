/**
 * PostContent 컴포넌트
 * 포스트 본문 + 애드센스 삽입
 */

'use client';

interface PostContentProps {
  content: string;
  title: string;
}

export function PostContent({ content, title }: PostContentProps) {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <div
        className="space-y-4 text-gray-800 dark:text-gray-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}
