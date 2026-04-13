/**
 * AdSense 대시보드 페이지
 */

import { StatsCard } from '@/components/StatsCard';

export default function AdsensePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AdSense 수익</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Google AdSense 수익 현황
        </p>
      </div>

      {/* 수익 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="이번 달 수익"
          value="$45.32"
          icon="💰"
          color="green"
        />
        <StatsCard
          title="노출 수"
          value="12.5K"
          icon="👁️"
          color="blue"
        />
        <StatsCard
          title="클릭 수"
          value="284"
          icon="🖱️"
          color="purple"
        />
        <StatsCard
          title="CTR"
          value="2.27%"
          icon="📊"
          color="blue"
        />
      </div>

      {/* 월별 수익 그래프 */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-6">월별 수익</h2>
        <div className="h-64 flex items-end justify-between gap-4">
          {[
            { month: '1월', value: 12 },
            { month: '2월', value: 18 },
            { month: '3월', value: 25 },
            { month: '4월', value: 45 },
          ].map((data) => (
            <div key={data.month} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg"
                style={{ height: `${(data.value / 45) * 100}%` }}
              />
              <p className="text-xs mt-2 font-medium">{data.month}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">${data.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 광고 유닛별 성과 */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">광고 유닛별 성과</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left py-3 px-4 font-semibold">광고 유닛</th>
              <th className="text-left py-3 px-4 font-semibold">노출</th>
              <th className="text-left py-3 px-4 font-semibold">클릭</th>
              <th className="text-left py-3 px-4 font-semibold">수익</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: '포스트 본문 광고 #1', views: 4200, clicks: 95, revenue: '$18.50' },
              { name: '포스트 본문 광고 #2', views: 3800, clicks: 82, revenue: '$15.20' },
              { name: '사이드바 스카이스크래퍼', views: 2500, clicks: 68, revenue: '$12.80' },
              { name: '광고 자동 배치', views: 2000, clicks: 39, revenue: '$8.82' },
            ].map((unit) => (
              <tr
                key={unit.name}
                className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="py-3 px-4 font-medium">{unit.name}</td>
                <td className="py-3 px-4">{unit.views}</td>
                <td className="py-3 px-4">{unit.clicks}</td>
                <td className="py-3 px-4 font-semibold">{unit.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
