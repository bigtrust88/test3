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
// Market Data API (Alpha Vantage)
// ============================================

const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_URL = 'https://www.alphavantage.co/query';
const CACHE_KEY = 'market_stocks_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1시간

interface AlphaVantageQuote {
  'Global Quote': {
    '01. symbol': string;
    '05. price': string;
    '09. change': string;
    '10. change percent': string;
  };
}

interface CachedData {
  data: MarketIndex[];
  timestamp: number;
}

/**
 * Alpha Vantage는 5 calls/min 제한이 있으므로
 * 순차 호출 + 딜레이 사용
 */
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMarketIndices(): Promise<MarketIndex[]> {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn('ALPHA_VANTAGE_API_KEY not set');
    return [];
  }

  // 캐시 확인
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const cachedData: CachedData = JSON.parse(cached);
      const isExpired = Date.now() - cachedData.timestamp > CACHE_DURATION;

      if (!isExpired) {
        console.log('[Market] Using cached data (expires in', Math.round((CACHE_DURATION - (Date.now() - cachedData.timestamp)) / 1000), 's)');
        return cachedData.data;
      }
    }
  }

  const indices = [
    { symbol: 'AAPL', name: 'Apple', emoji: '🍎' },
    { symbol: 'MSFT', name: 'Microsoft', emoji: '💻' },
    { symbol: 'TSLA', name: 'Tesla', emoji: '⚡' },
    { symbol: 'NVDA', name: 'NVIDIA', emoji: '🎮' },
  ];

  const results: MarketIndex[] = [];

  try {
    // 순차 호출: Rate limit (5 calls/min) 고려
    for (const index of indices) {
      try {
        const url = new URL(ALPHA_VANTAGE_URL);
        url.searchParams.append('function', 'GLOBAL_QUOTE');
        url.searchParams.append('symbol', index.symbol);
        url.searchParams.append('apikey', ALPHA_VANTAGE_API_KEY);

        console.log(`[Market] Fetching ${index.symbol} from: ${url.toString()}`);

        const response = await fetch(url.toString());
        console.log(`[Market] Response status for ${index.symbol}: ${response.status}`);

        const data: any = await response.json();
        console.log(`[Market] Response data for ${index.symbol}:`, JSON.stringify(data));

        if (!data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
          console.error(
            `Alpha Vantage API error for ${index.symbol}: No Global Quote data`,
            data,
          );
          results.push({
            symbol: index.symbol,
            name: index.name,
            emoji: index.emoji,
            price: 0,
            change: 0,
            changePercent: 0,
            timestamp: 0,
          });
        } else {
          const quote = data['Global Quote'];
          const price = parseFloat(quote['05. price']) || 0;
          const change = parseFloat(quote['09. change']) || 0;
          const changePercentStr = quote['10. change percent']
            .replace('%', '')
            .trim();
          const changePercent = parseFloat(changePercentStr) || 0;

          results.push({
            symbol: index.symbol,
            name: index.name,
            emoji: index.emoji,
            price,
            change,
            changePercent,
            timestamp: Math.floor(Date.now() / 1000),
          });

          console.log(`[Market] ${index.symbol}: $${price}`);
        }

        // Rate limit 회피: 각 호출 사이 1.5초 딜레이
        // Alpha Vantage 무료: 1 request/second 제한
        if (indices.indexOf(index) < indices.length - 1) {
          await delay(1500);
        }
      } catch (error) {
        console.error(`Failed to fetch ${index.symbol}:`, error);
        results.push({
          symbol: index.symbol,
          name: index.name,
          emoji: index.emoji,
          price: 0,
          change: 0,
          changePercent: 0,
          timestamp: 0,
        });
      }
    }

    // 캐시 저장
    if (results.length > 0 && typeof window !== 'undefined') {
      const cacheData: CachedData = {
        data: results,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('[Market] Cache saved for 1 hour');
    }

    return results;
  } catch (error) {
    console.error('Failed to fetch market indices:', error);
    return [];
  }
}
