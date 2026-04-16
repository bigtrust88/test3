/**
 * 프로젝트 전역 상수
 */

export const CATEGORIES = [
  {
    slug: 'stock-analysis',
    name: 'Stock Analysis',
    icon: '📈',
    description: 'In-depth analysis of individual US stocks',
  },
  {
    slug: 'market-trend',
    name: 'Market Trend',
    icon: '📊',
    description: 'Overall US stock market trends and analysis',
  },
  {
    slug: 'earnings',
    name: 'Earnings',
    icon: '💰',
    description: 'Corporate earnings reports and results analysis',
  },
  {
    slug: 'etf-analysis',
    name: 'ETF Analysis',
    icon: '🏦',
    description: 'ETF investment strategies and analysis',
  },
  {
    slug: 'investment-strategy',
    name: 'Investment Strategy',
    icon: '🎯',
    description: 'Long-term investment strategies and portfolio management',
  },
];

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',

  // Posts (공개)
  POSTS_LIST: '/posts',
  POSTS_BY_CATEGORY: '/posts/category/:slug',
  POST_DETAIL: '/posts/:slug',

  // Tags (공개)
  TAGS_LIST: '/tags',
  POSTS_BY_TAG: '/posts/tag/:slug',

  // Admin - Posts
  ADMIN_POSTS: '/admin/posts',
  ADMIN_POSTS_CREATE: '/admin/posts',
  ADMIN_POST_UPDATE: '/admin/posts/:id',
  ADMIN_POST_DELETE: '/admin/posts/:id',

  // Admin - AI Logs
  ADMIN_AI_LOGS: '/admin/ai-logs',
  ADMIN_AI_LOG_DETAIL: '/admin/ai-logs/:id',

  // Admin - Dashboard
  ADMIN_DASHBOARD: '/admin/dashboard',
};

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};

export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  SEARCH: '/search',

  // Category routes
  CATEGORY: (slug: string) => `/${slug}`,

  // Post routes
  POST: (slug: string) => `/post/${slug}`,
  TAG: (tag: string) => `/tag/${tag}`,

  // Admin routes
  ADMIN: '/admin',
  ADMIN_POSTS: '/admin/posts',
  ADMIN_POST_CREATE: '/admin/posts/new',
  ADMIN_POST_EDIT: (id: string) => `/admin/posts/${id}/edit`,
  ADMIN_AI_LOGS: '/admin/ai-logs',
  ADMIN_SCHEDULER: '/admin/scheduler',
  ADMIN_ADSENSE: '/admin/adsense',
  ADMIN_SETTINGS: '/admin/settings',
};

// Market indices (real-time widget)
export const MARKET_INDICES = [
  { symbol: '^GSPC', name: 'S&P 500', icon: '📈' },
  { symbol: '^IXIC', name: 'NASDAQ', icon: '💻' },
  { symbol: '^DJI', name: 'DOW', icon: '🏛' },
  { symbol: '^VIX', name: 'VIX (Fear Index)', icon: '😱' },
];

// 저장소 키
export const STORAGE_KEYS = {
  JWT_TOKEN: 'stock-blog:jwt',
  DARK_MODE: 'stock-blog:dark-mode',
  RECENT_SEARCHES: 'stock-blog:recent-searches',
};

// UI 설정
export const UI = {
  HEADER_HEIGHT: '64px',
  SIDEBAR_WIDTH: '250px',
  MOBILE_BREAKPOINT: 768,
};
