/**
 * PostContent 컴포넌트
 * 포스트 본문 + 애드센스 삽입
 */

'use client';

import { AdSenseUnit } from './AdSenseUnit';

interface PostContentProps {
  content: string;
  title: string;
}

export function PostContent({ content, title }: PostContentProps) {
  // HTML을 안전하게 렌더링
  const htmlContent = content;

  // 문단 수를 세어서 애드센스 위치 결정
  const paragraphs = htmlContent.split('</p>');
  const hasEnoughContent = paragraphs.length > 5;

  return (
    <article className="prose dark:prose-invert max-w-none">
      {/* 애드센스 #1 - 본문 시작 직후 */}
      <div className="my-8">
        <AdSenseUnit adSlot="1234567890" format="rectangle" fullWidth={true} />
      </div>

      {/* 본문 콘텐츠 */}
      <div
        className="space-y-4 text-gray-800 dark:text-gray-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* 애드센스 #2 - 본문 중간 */}
      {hasEnoughContent && (
        <div className="my-8">
          <AdSenseUnit adSlot="1234567891" format="rectangle" fullWidth={true} />
        </div>
      )}

      {/* 애드센스 #3 - 본문 끝 */}
      <div className="my-8">
        <AdSenseUnit adSlot="1234567892" format="rectangle" fullWidth={true} />
      </div>
    </article>
  );
}
