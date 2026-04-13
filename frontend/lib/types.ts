/**
 * TypeScript 타입 정의
 * Backend NestJS API와 동일한 스키마
 */

export interface User {
  id: string;
  uuid: string;
  email: string;
  display_name: string;
  role: 'admin' | 'editor' | 'user';
  created_at: string;
}

export interface Category {
  id: string;
  uuid: string;
  name_ko: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Tag {
  id: string;
  uuid: string;
  name: string;
  slug: string;
  post_count: number;
  created_at: string;
}

export interface Post {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  excerpt: string;
  content_md: string;
  content_html: string;
  cover_image_url: string;
  reading_time_mins: number;
  is_published: boolean;
  is_ai_generated: boolean;
  ai_source_urls?: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
  category: Category;
  tags: Tag[];
  author?: User;
}

export interface AiLog {
  id: string;
  uuid: string;
  post_id?: string;
  n8n_execution_id?: string;
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
  thumbnail_generated: boolean;
  thumbnail_url?: string;
  thumbnail_sentiment?: 'bullish' | 'bearish' | 'neutral';
  crawled_urls?: string[];
  claude_prompt_tokens?: number;
  claude_completion_tokens?: number;
  claude_model?: string;
  created_at: string;
  post?: Post;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  sortBy?: 'latest' | 'popular';
  is_published?: boolean;
}
