/**
 * StatsCard 컴포넌트
 * 대시보드 통계 카드
 */

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: number;
  color?: 'blue' | 'green' | 'red' | 'purple';
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800',
    purple: 'bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-800',
  };

  return (
    <div className={`rounded-lg p-6 border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold">{value}</p>
          {trend !== undefined && (
            <p className={`text-sm mt-2 ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
