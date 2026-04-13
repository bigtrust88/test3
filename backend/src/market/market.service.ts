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
  async getMarketData(): Promise<MarketIndex[]> {
    // 개발/테스트: 더미 데이터 직접 반환
    // 프로덕션에서는 실제 API 호출로 대체
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
