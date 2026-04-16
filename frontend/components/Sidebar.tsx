/**
 * Sidebar 컴포넌트
 * 포스트 상세 페이지 사이드바 (데스크탑만)
 */

import { Tag } from '@/lib/types';
import { TagCloud } from './TagCloud';
import { AdSenseUnit } from './AdSenseUnit';

interface SidebarProps {
  tags: Tag[];
}

export function Sidebar({ tags }: SidebarProps) {
  return (
    <aside className="hidden lg:block space-y-8 sticky top-24">
      {/* 애드센스 스카이스크래퍼 */}
      <AdSenseUnit adSlot="1234567893" format="vertical" />

      {/* 태그 클라우드 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <TagCloud tags={tags} maxSize={20} />
      </div>

      {/* 뉴스레터 구독 */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-bold mb-4">Newsletter</h3>
        <p className="text-sm mb-4 text-gray-700 dark:text-gray-300">
          Get weekly market analysis reports delivered to your inbox.
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="Your email address"
            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </aside>
  );
}
