import { Injectable } from '@nestjs/common';

export interface MarketIndex {
  symbol: string;
  name: string;
  emoji: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

@Injectable()
export class MarketService {
  private readonly stocks = [
    { symbol: 'AAPL', name: 'Apple', emoji: '🍎' },
    { symbol: 'MSFT', name: 'Microsoft', emoji: '💻' },
    { symbol: 'TSLA', name: 'Tesla', emoji: '⚡' },
    { symbol: 'NVDA', name: 'NVIDIA', emoji: '🎮' },
  ];

  async getMarketData(): Promise<MarketIndex[]> {
    try {
      const symbols = this.stocks.map((s) => s.symbol).join(',');
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.quoteResponse?.result) {
        return this.getDummyData();
      }

      return this.stocks.map((stock) => {
        const quote = data.quoteResponse.result.find(
          (q: any) => q.symbol === stock.symbol,
        );

        if (!quote) {
          return {
            ...stock,
            price: 0,
            change: 0,
            changePercent: 0,
            timestamp: Math.floor(Date.now() / 1000),
          };
        }

        return {
          symbol: stock.symbol,
          name: stock.name,
          emoji: stock.emoji,
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          timestamp: Math.floor(Date.now() / 1000),
        };
      });
    } catch (error) {
      console.error('[Market] Error fetching data:', error);
      return this.getDummyData();
    }
  }

  private getDummyData(): MarketIndex[] {
    return [
      {
        symbol: 'AAPL',
        name: 'Apple',
        emoji: '🍎',
        price: 230.5,
        change: 2.5,
        changePercent: 1.1,
        timestamp: Math.floor(Date.now() / 1000),
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft',
        emoji: '💻',
        price: 425.75,
        change: 5.2,
        changePercent: 1.24,
        timestamp: Math.floor(Date.now() / 1000),
      },
      {
        symbol: 'TSLA',
        name: 'Tesla',
        emoji: '⚡',
        price: 182.3,
        change: -3.1,
        changePercent: -1.67,
        timestamp: Math.floor(Date.now() / 1000),
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA',
        emoji: '🎮',
        price: 875.2,
        change: 12.5,
        changePercent: 1.45,
        timestamp: Math.floor(Date.now() / 1000),
      },
    ];
  }
}
