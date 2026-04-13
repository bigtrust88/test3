/**
 * MarketWidget 컴포넌트
 * Finnhub API를 사용한 실시간 주가 위젯
 */

'use client';

import { useEffect, useState } from 'react';
import { MarketIndex } from '@/lib/types';
import { getMarketIndices } from '@/lib/api';

export function MarketWidget() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getMarketIndices();
        setIndices(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch market indices:', err);
        setError('마켓 데이터를 불러올 수 없습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 30초마다 새로고침
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const formatChange = (change: number) => {
    if (change === 0) return '0.00';
    return change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
  };

  const formatChangePercent = (percent: number) => {
    if (percent === 0) return '0.00%';
    return percent > 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <section className="py-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">주요 지수</h2>
        {loading && <span className="text-xs text-gray-500">업데이트 중...</span>}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {loading && indices.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 animate-pulse"
            >
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indices.map((index) => (
            <div
              key={index.symbol}
              className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {index.name}
                </span>
                <span className="text-xl">{index.emoji}</span>
              </div>

              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatPrice(index.price)}
              </div>

              <div className={`text-sm font-semibold ${getChangeColor(index.change)}`}>
                {formatChange(index.change)} ({formatChangePercent(index.changePercent)})
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {index.timestamp ? new Date(index.timestamp * 1000).toLocaleTimeString('ko-KR') : '-'}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        데이터는 Finnhub에서 제공됩니다. 30초마다 자동 업데이트됩니다.
      </p>
    </section>
  );
}
