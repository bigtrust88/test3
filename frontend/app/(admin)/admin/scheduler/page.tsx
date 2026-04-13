/**
 * 스케줄러 페이지
 */

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function SchedulerPage() {
  const schedules = [
    {
      time: '08:00',
      name: '프리마켓 브리핑',
      status: 'active',
      lastRun: '2024-04-13 08:00:15',
      successRate: 100,
    },
    {
      time: '14:00',
      name: '심층분석',
      status: 'active',
      lastRun: '2024-04-13 14:00:42',
      successRate: 98,
    },
    {
      time: '22:00',
      name: '마감 리캡',
      status: 'active',
      lastRun: '2024-04-13 22:00:15',
      successRate: 95,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">스케줄 관리</h1>
        <p className="text-gray-600 dark:text-gray-400">
          n8n 자동화 스케줄 설정
        </p>
      </div>

      {/* 스케줄 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {schedules.map((schedule) => (
          <div
            key={schedule.time}
            className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800"
          >
            <div className="mb-4">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {schedule.time}
              </div>
              <p className="text-lg font-semibold mt-2">{schedule.name}</p>
            </div>

            <div className="space-y-3">
              <div>
                <Badge
                  variant={schedule.status === 'active' ? 'success' : 'secondary'}
                  size="sm"
                >
                  {schedule.status === 'active' ? '✓ 활성' : '○ 비활성'}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  마지막 실행
                </p>
                <p className="text-sm font-mono">{schedule.lastRun}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  성공률
                </p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {schedule.successRate}%
                </p>
              </div>

              <Button variant="primary" size="sm" fullWidth>
                지금 실행
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 전체 설정 */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">전체 설정</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              기본 시간대 (KST)
            </label>
            <select className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
              <option>아시아/서울</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              defaultChecked
              className="w-4 h-4 rounded"
            />
            <label htmlFor="enabled" className="text-sm font-medium">
              자동화 활성화
            </label>
          </div>

          <Button variant="primary">저장</Button>
        </div>
      </section>
    </div>
  );
}
