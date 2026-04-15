'use client';

import Image from 'next/image';

interface PostContentProps {
  content: string;
  title: string;
  coverImageUrl?: string | null;
}

export function PostContent({ content, title, coverImageUrl }: PostContentProps) {
  return (
    <article className="prose dark:prose-invert max-w-none">
      {/* 커버 이미지 - 본문 상단 */}
      {coverImageUrl && (
        <div className="relative w-full h-80 mb-8 rounded-lg overflow-hidden not-prose">
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* 본문 콘텐츠 */}
      <div
        className="space-y-4 text-gray-800 dark:text-gray-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}
