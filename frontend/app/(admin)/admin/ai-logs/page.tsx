/**
 * AI 로그 페이지
 */

import { Badge } from '@/components/ui/Badge';

export default function AILogsPage() {
  const logs = [
    {
      id: '1',
      time: '2024-04-13 22:00:15',
      n8nId: 'n8n_exec_001',
      status: 'success',
      post: '마감 리캡',
      tokens: 2156,
      thumbnail: '✓',
    },
    {
      id: '2',
      time: '2024-04-13 14:00:42',
      n8nId: 'n8n_exec_002',
      status: 'success',
      post: '심층분석',
      tokens: 2089,
      thumbnail: '✓',
    },
    {
      id: '3',
      time: '2024-04-13 08:00:09',
      n8nId: 'n8n_exec_003',
      status: 'success',
      post: '프리마켓',
      tokens: 1945,
      thumbnail: '✓',
    },
    {
      id: '4',
      time: '2024-04-12 22:01:33',
      n8nId: 'n8n_exec_004',
      status: 'failed',
      post: '-',
      tokens: 512,
      thumbnail: '✗',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI 자동화 로그</h1>
        <p className="text-gray-600 dark:text-gray-400">
          n8n + Claude API 실행 기록
        </p>
      </div>

      {/* 로그 테이블 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <th className="text-left py-3 px-4 font-semibold">실행 시간</th>
              <th className="text-left py-3 px-4 font-semibold">n8n ID</th>
              <th className="text-left py-3 px-4 font-semibold">상태</th>
              <th className="text-left py-3 px-4 font-semibold">생성된 포스트</th>
              <th className="text-left py-3 px-4 font-semibold">토큰</th>
              <th className="text-left py-3 px-4 font-semibold">썸네일</th>
              <th className="text-left py-3 px-4 font-semibold">액션</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-3 px-4 text-xs font-mono">{log.time}</td>
                <td className="py-3 px-4 text-xs font-mono">{log.n8nId}</td>
                <td className="py-3 px-4">
                  <Badge
                    variant={log.status === 'success' ? 'success' : 'danger'}
                    size="sm"
                  >
                    {log.status === 'success' ? '✓ 성공' : '✗ 실패'}
                  </Badge>
                </td>
                <td className="py-3 px-4">{log.post}</td>
                <td className="py-3 px-4">{log.tokens}</td>
                <td className="py-3 px-4">
                  <span
                    className={log.thumbnail === '✓' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}
                  >
                    {log.thumbnail}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="text-blue-600 dark:text-blue-400 hover:underline text-xs">
                    상세보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">성공</p>
          <p className="text-2xl font-bold">3/4 (75%)</p>
        </div>
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">총 토큰 사용</p>
          <p className="text-2xl font-bold">6,702</p>
        </div>
        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">평균 토큰</p>
          <p className="text-2xl font-bold">1,676</p>
        </div>
      </div>
    </div>
  );
}
