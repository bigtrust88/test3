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
  const url = `${API_URL}/api${endpoint}`;

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
// Market Data API (Backend)
// ============================================

export async function getMarketIndices(): Promise<MarketIndex[]> {
  try {
    const response = await fetchAPI<MarketIndex[]>('/market/indices');
    return response;
  } catch (error) {
    console.error('[Market] Error fetching data:', error);
    return [];
  }
}
