/**
 * 프로젝트 전역 상수
 */

export const CATEGORIES = [
  {
    slug: 'stock-analysis',
    name: '종목분석',
    icon: '📈',
    description: '개별 주식 종목에 대한 심층 분석',
  },
  {
    slug: 'market-trend',
    name: '시장동향',
    icon: '📊',
    description: '미국 주식 시장 전반적인 동향과 분석',
  },
  {
    slug: 'earnings',
    name: '실적발표',
    icon: '💰',
    description: '기업 실적 발표와 결과 분석',
  },
  {
    slug: 'etf-analysis',
    name: 'ETF분석',
    icon: '🏦',
    description: 'ETF 투자 전략과 분석',
  },
  {
    slug: 'investment-strategy',
    name: '투자전략',
    icon: '🎯',
    description: '장기 투자 전략과 포트폴리오 관리',
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

// 마켓 인덱스 (실시간 위젯)
export const MARKET_INDICES = [
  { symbol: '^GSPC', name: 'S&P 500', icon: '📈' },
  { symbol: '^IXIC', name: 'NASDAQ', icon: '💻' },
  { symbol: '^DJI', name: 'DOW', icon: '🏛' },
  { symbol: '^VIX', name: 'VIX (공포지수)', icon: '😱' },
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
