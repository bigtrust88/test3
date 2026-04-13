/**
 * MarketWidget 컴포넌트
 * 실시간 주가 위젯 (TradingView 임베드)
 */

'use client';

import { useEffect } from 'react';

export function MarketWidget() {
  useEffect(() => {
    // TradingView 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <section className="py-8 mb-8">
      <h2 className="text-2xl font-bold mb-6">주요 지수</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* S&P 500 */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">S&P 500</div>
          <div className="text-2xl font-bold">📈</div>
          <iframe
            src="https://s3.tradingview.com/widgetembed/?frameElementId=tradingview_123&symbol=GSPC&interval=D&hide_top_toolbar=1&hide_legend=1&theme=dark"
            style={{ width: '100%', height: '100px', border: 'none' }}
          />
        </div>

        {/* NASDAQ */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">NASDAQ</div>
          <div className="text-2xl font-bold">💻</div>
          <iframe
            src="https://s3.tradingview.com/widgetembed/?frameElementId=tradingview_124&symbol=IXIC&interval=D&hide_top_toolbar=1&hide_legend=1&theme=dark"
            style={{ width: '100%', height: '100px', border: 'none' }}
          />
        </div>

        {/* DOW */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">DOW JONES</div>
          <div className="text-2xl font-bold">🏛️</div>
          <iframe
            src="https://s3.tradingview.com/widgetembed/?frameElementId=tradingview_125&symbol=DJI&interval=D&hide_top_toolbar=1&hide_legend=1&theme=dark"
            style={{ width: '100%', height: '100px', border: 'none' }}
          />
        </div>

        {/* VIX */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">VIX (공포지수)</div>
          <div className="text-2xl font-bold">😱</div>
          <iframe
            src="https://s3.tradingview.com/widgetembed/?frameElementId=tradingview_126&symbol=VIX&interval=D&hide_top_toolbar=1&hide_legend=1&theme=dark"
            style={{ width: '100%', height: '100px', border: 'none' }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        데이터는 TradingView에서 제공됩니다. 실시간 시세는 마켓 시간에만 업데이트됩니다.
      </p>
    </section>
  );
}
