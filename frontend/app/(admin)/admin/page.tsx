/**
 * 관리자 대시보드
 */

import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="총 포스트"
          value="42"
          icon="📝"
          color="blue"
        />
        <StatsCard
          title="오늘 발행"
          value="2/3"
          icon="🎯"
          color="green"
        />
        <StatsCard
          title="AI 성공률"
          value="98%"
          icon="🤖"
          color="purple"
        />
        <StatsCard
          title="월간 조회수"
          value="12.5K"
          icon="👁️"
          trend={12}
          color="blue"
        />
      </div>

      {/* 빠른 액션 */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">빠른 액션</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/posts/new">
            <Button variant="primary">
              ✍️ 새 포스트 작성
            </Button>
          </Link>
          <Link href="/admin/posts">
            <Button variant="secondary">
              📋 포스트 관리
            </Button>
          </Link>
          <Link href="/admin/ai-logs">
            <Button variant="secondary">
              🤖 AI 로그 보기
            </Button>
          </Link>
          <Link href="/admin/scheduler">
            <Button variant="secondary">
              ⏰ 스케줄 관리
            </Button>
          </Link>
        </div>
      </section>

      {/* 최근 실행 로그 */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">최근 AI 실행</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4">시간</th>
                <th className="text-left py-3 px-4">상태</th>
                <th className="text-left py-3 px-4">포스트</th>
                <th className="text-left py-3 px-4">토큰</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-3 px-4">2024-04-13 22:00</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded">
                    ✓ 성공
                  </span>
                </td>
                <td className="py-3 px-4">마감 리캡</td>
                <td className="py-3 px-4">2,156</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-3 px-4">2024-04-13 14:00</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded">
                    ✓ 성공
                  </span>
                </td>
                <td className="py-3 px-4">심층분석</td>
                <td className="py-3 px-4">2,089</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-3 px-4">2024-04-13 08:00</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded">
                    ✓ 성공
                  </span>
                </td>
                <td className="py-3 px-4">프리마켓</td>
                <td className="py-3 px-4">1,945</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 시스템 상태 */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">시스템 상태</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900">
            <span className="font-medium">Backend API</span>
            <span className="text-green-600 dark:text-green-400">✓ 정상</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900">
            <span className="font-medium">Database</span>
            <span className="text-green-600 dark:text-green-400">✓ 정상</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900">
            <span className="font-medium">n8n Workflow</span>
            <span className="text-green-600 dark:text-green-400">✓ 활성</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900">
            <span className="font-medium">Claude API</span>
            <span className="text-green-600 dark:text-green-400">✓ 정상</span>
          </div>
        </div>
      </section>
    </div>
  );
}
