/**
 * Backend API 클라이언트
 * NestJS Backend와 동기화된 엔드포인트
 * Backend: GET /posts/published (공개), GET /posts (관리자/JWT)
 */

import { ApiResponse, Post, Category, Tag, LoginResponse, QueryParams, MarketIndex } from './types';
import { STORAGE_KEYS } from './constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// JWT 토큰 관리 (클라이언트 전용)
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
};

const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
};

const clearAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
};

// Fetch wrapper
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // JWT 토큰 자동 첨부
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// Auth API
// ============================================

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await fetchAPI<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data.access_token) {
    setAuthToken(data.access_token);
  }

  return data;
}

export async function logout(): Promise<void> {
  clearAuthToken();
}

// ============================================
// Posts API (공개 - /posts/published)
// ============================================

export async function getPosts(params?: QueryParams): Promise<ApiResponse<Post[]>> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.search) searchParams.append('search', params.search);
  if (params?.category) searchParams.append('category', params.category); // slug 사용
  if (params?.tag) searchParams.append('tag', params.tag); // slug 사용
  if (params?.sortBy) searchParams.append('sort', params.sortBy); // Backend: 'sort' 파라미터명

  const query = searchParams.toString();
  const endpoint = query ? `/posts/published?${query}` : '/posts/published';

  return fetchAPI<ApiResponse<Post[]>>(endpoint);
}

export async function getPostBySlug(slug: string): Promise<Post> {
  return fetchAPI<Post>(`/posts/published/${slug}`);
}

export async function getPostsByCategory(
  slug: string,
  params?: QueryParams,
): Promise<ApiResponse<Post[]>> {
  // Backend는 /posts/published?category=slug 형식을 사용
  return getPosts({ ...params, category: slug });
}

// ============================================
// Categories API
// ============================================

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  return fetchAPI<ApiResponse<Category[]>>('/categories');
}

// ============================================
// Tags API
// ============================================

export async function getTags(): Promise<ApiResponse<Tag[]>> {
  return fetchAPI<ApiResponse<Tag[]>>('/tags');
}

export async function getPostsByTag(
  tag: string,
  params?: QueryParams,
): Promise<ApiResponse<Post[]>> {
  // Backend는 /posts/published?tag=slug 형식을 사용
  return getPosts({ ...params, tag });
}

// ============================================
// Admin API (인증 필수 - JWT)
// ============================================

export async function getAdminPosts(params?: QueryParams): Promise<ApiResponse<Post[]>> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.search) searchParams.append('search', params.search);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.tag) searchParams.append('tag', params.tag);
  if (params?.is_published !== undefined) {
    searchParams.append('is_published', params.is_published.toString());
  }
  if (params?.sortBy) searchParams.append('sort', params.sortBy);

  const query = searchParams.toString();
  const endpoint = query ? `/posts?${query}` : '/posts';

  return fetchAPI<ApiResponse<Post[]>>(endpoint);
}

export async function createPost(post: Partial<Post>): Promise<ApiResponse<Post>> {
  return fetchAPI<ApiResponse<Post>>('/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  });
}

export async function updatePost(id: string, post: Partial<Post>): Promise<ApiResponse<Post>> {
  return fetchAPI<ApiResponse<Post>>(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(post),
  });
}

export async function deletePost(id: string): Promise<void> {
  await fetchAPI(`/posts/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// Market Data API (Yahoo Finance - Unofficial)
// ============================================

const YAHOO_FINANCE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const CACHE_KEY = 'market_stocks_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5분

interface YahooQuoteResponse {
  quoteResponse: {
    result: {
      symbol: string;
      regularMarketPrice: number;
      regularMarketChange: number;
      regularMarketChangePercent: number;
    }[];
  };
}

interface CachedData {
  data: MarketIndex[];
  timestamp: number;
}

// 더미 데이터 (API 실패 시 표시)
const DUMMY_DATA: MarketIndex[] = [
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

export async function getMarketIndices(): Promise<MarketIndex[]> {
  // 캐시 확인
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const cachedData: CachedData = JSON.parse(cached);
        const isExpired = Date.now() - cachedData.timestamp > CACHE_DURATION;

        if (!isExpired && cachedData.data && cachedData.data.length > 0) {
          console.log(
            `[Market] Using cached data (expires in ${Math.round((CACHE_DURATION - (Date.now() - cachedData.timestamp)) / 1000)}s)`,
          );
          return cachedData.data;
        }
      } catch (e) {
        console.log('[Market] Cache error, clearing');
        localStorage.removeItem(CACHE_KEY);
      }
    }
  }

  const stocks = [
    { symbol: 'AAPL', name: 'Apple', emoji: '🍎' },
    { symbol: 'MSFT', name: 'Microsoft', emoji: '💻' },
    { symbol: 'TSLA', name: 'Tesla', emoji: '⚡' },
    { symbol: 'NVDA', name: 'NVIDIA', emoji: '🎮' },
  ];

  try {
    // 한 번에 모든 심볼 조회 (배치 요청)
    const symbols = stocks.map((s) => s.symbol).join(',');
    const url = new URL(YAHOO_FINANCE_URL);
    url.searchParams.append('symbols', symbols);

    console.log(`[Market] Fetching from Yahoo Finance: ${symbols}`);

    // CORS 프록시를 통해 요청 (개발 환경용)
    const proxyUrl = CORS_PROXY + url.toString();
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: YahooQuoteResponse = await response.json();

    if (!data.quoteResponse?.result) {
      throw new Error('Invalid response format');
    }

    const results = stocks.map((stock) => {
      const quote = data.quoteResponse.result.find((q) => q.symbol === stock.symbol);

      if (!quote) {
        console.warn(`[Market] No data for ${stock.symbol}`);
        return {
          symbol: stock.symbol,
          name: stock.name,
          emoji: stock.emoji,
          price: 0,
          change: 0,
          changePercent: 0,
          timestamp: 0,
        };
      }

      console.log(
        `[Market] ${stock.symbol}: $${quote.regularMarketPrice?.toFixed(2)} (${quote.regularMarketChangePercent?.toFixed(2)}%)`,
      );

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

    // 캐시 저장
    if (typeof window !== 'undefined') {
      const cacheData: CachedData = {
        data: results,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('[Market] Cache saved for 5 minutes');
    }

    return results;
  } catch (error) {
    console.error('[Market] Error fetching data:', error);

    // 캐시가 있으면 만료되었어도 반환
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const cachedData: CachedData = JSON.parse(cached);
          console.log('[Market] Using stale cache due to error');
          return cachedData.data;
        } catch (e) {
          // 무시
        }
      }
    }

    // 최후의 수단: 더미 데이터 반환 (실제 데이터를 받을 때까지 임시)
    console.log('[Market] Returning dummy data');
    return DUMMY_DATA;
  }
}
