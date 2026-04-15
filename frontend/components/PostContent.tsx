'use client';

interface PostContentProps {
  content: string;
  title: string;
  coverImageUrl?: string | null;
}

export function PostContent({ content, title, coverImageUrl }: PostContentProps) {
  return (
    <article className="prose dark:prose-invert max-w-none">
      {/* 커버 이미지 - 본문 상단 (next/image 대신 img 사용: prose CSS 충돌 방지) */}
      {coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImageUrl}
          alt={title}
          className="w-full h-80 object-cover rounded-lg mb-8 not-prose"
          style={{ display: 'block' }}
        />
      )}

      {/* 본문 콘텐츠 */}
      <div
        className="space-y-4 text-gray-800 dark:text-gray-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content || '' }}
      />
    </article>
  );
}
