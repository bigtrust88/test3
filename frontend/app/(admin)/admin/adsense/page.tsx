/**
 * AdSense Dashboard Page
 */

import { StatsCard } from '@/components/StatsCard';

export default function AdsensePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AdSense Revenue</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Google AdSense revenue overview
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="This Month"
          value="$45.32"
          icon="💰"
          color="green"
        />
        <StatsCard
          title="Impressions"
          value="12.5K"
          icon="👁️"
          color="blue"
        />
        <StatsCard
          title="Clicks"
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

      {/* Monthly Revenue Chart */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-6">Monthly Revenue</h2>
        <div className="h-64 flex items-end justify-between gap-4">
          {[
            { month: 'Jan', value: 12 },
            { month: 'Feb', value: 18 },
            { month: 'Mar', value: 25 },
            { month: 'Apr', value: 45 },
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

      {/* Ad Unit Performance */}
      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">Ad Unit Performance</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left py-3 px-4 font-semibold">Ad Unit</th>
              <th className="text-left py-3 px-4 font-semibold">Impressions</th>
              <th className="text-left py-3 px-4 font-semibold">Clicks</th>
              <th className="text-left py-3 px-4 font-semibold">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Post Body Ad #1', views: 4200, clicks: 95, revenue: '$18.50' },
              { name: 'Post Body Ad #2', views: 3800, clicks: 82, revenue: '$15.20' },
              { name: 'Sidebar Skyscraper', views: 2500, clicks: 68, revenue: '$12.80' },
              { name: 'Auto Ads', views: 2000, clicks: 39, revenue: '$8.82' },
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
