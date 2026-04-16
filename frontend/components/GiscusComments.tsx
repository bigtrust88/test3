/**
 * GiscusComments 컴포넌트
 * GitHub Discussions 기반 댓글 (Giscus)
 */

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

interface GiscusCommentsProps {
  slug: string;
}

export function GiscusComments({ slug }: GiscusCommentsProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', 'YOUR_GITHUB_REPO');
    script.setAttribute('data-repo-id', 'YOUR_REPO_ID');
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    script.setAttribute('data-lang', 'en');

    containerRef.current.appendChild(script);
  }, [theme]);

  return (
    <section className="py-12 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-8">Comments</h2>
      <div ref={containerRef} />
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        Sign in with your GitHub account to leave a comment.
      </p>
    </section>
  );
}
