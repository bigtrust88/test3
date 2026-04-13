/**
 * 설정 페이지
 */

import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-gray-600 dark:text-gray-400">
          사이트 전체 설정
        </p>
      </div>

      {/* 기본 설정 */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 max-w-2xl">
        <h2 className="text-xl font-bold mb-6">기본 정보</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              사이트 제목
            </label>
            <input
              type="text"
              defaultValue="US Stock Story"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              사이트 설명
            </label>
            <textarea
              defaultValue="한국 개인 투자자를 위한 미국 주식 분석 블로그"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              소유자 이름
            </label>
            <input
              type="text"
              defaultValue="US Stock Story Team"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            />
          </div>

          <Button variant="primary">저장</Button>
        </div>
      </section>

      {/* API 설정 */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 max-w-2xl">
        <h2 className="text-xl font-bold mb-6">API 설정</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Backend API URL
            </label>
            <input
              type="url"
              defaultValue="http://localhost:3001"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Claude API 키 (일부만 표시)
            </label>
            <input
              type="password"
              defaultValue="sk-ant-v0-••••••••••••••••••••••••••••••••••••••••••••••••"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-sm"
              disabled
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              API 키는 backend 환경에서만 관리됩니다.
            </p>
          </div>

          <Button variant="primary">저장</Button>
        </div>
      </section>

      {/* 위험 영역 */}
      <section className="bg-red-50 dark:bg-red-900 rounded-lg p-6 border border-red-200 dark:border-red-800 max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
          위험 영역
        </h2>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          이 작업들은 되돌릴 수 없으니 주의하세요.
        </p>
        <div className="space-y-2">
          <button className="w-full px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            모든 포스트 초기화
          </button>
          <button className="w-full px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            모든 데이터 초기화
          </button>
        </div>
      </section>
    </div>
  );
}
