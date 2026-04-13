/**
 * AdminSidebar 컴포넌트
 * 관리자 좌측 네비게이션
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTE_PATHS } from '@/lib/constants';
import clsx from 'clsx';

const ADMIN_MENU = [
  { label: '대시보드', href: ROUTE_PATHS.ADMIN, icon: '📊' },
  { label: '포스트 관리', href: ROUTE_PATHS.ADMIN_POSTS, icon: '✍️' },
  { label: 'AI 로그', href: ROUTE_PATHS.ADMIN_AI_LOGS, icon: '🤖' },
  { label: '스케줄러', href: ROUTE_PATHS.ADMIN_SCHEDULER, icon: '⏰' },
  { label: 'AdSense', href: ROUTE_PATHS.ADMIN_ADSENSE, icon: '💰' },
  { label: '설정', href: ROUTE_PATHS.ADMIN_SETTINGS, icon: '⚙️' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <nav className="p-6 space-y-2">
        {ADMIN_MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
              pathname === item.href
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
            )}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
