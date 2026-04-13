import { v4 as uuidv4 } from 'uuid';

/**
 * 초기 카테고리 데이터
 * 5개 고정 카테고리
 */
export const CATEGORIES = [
  {
    id: uuidv4(),
    slug: '종목분석',
    name_ko: '종목분석',
    description: '개별 종목에 대한 심층 분석 및 투자 관점',
  },
  {
    id: uuidv4(),
    slug: '시장동향',
    name_ko: '시장동향',
    description: '미국 주식 시장 전체 흐름 및 경제 지표 해석',
  },
  {
    id: uuidv4(),
    slug: '실적발표',
    name_ko: '실적발표',
    description: '기업 실적 발표 및 어닝 서프라이즈 분석',
  },
  {
    id: uuidv4(),
    slug: 'etf-분석',
    name_ko: 'ETF분석',
    description: '상장지수펀드 및 섹터 분석',
  },
  {
    id: uuidv4(),
    slug: '투자전략',
    name_ko: '투자전략',
    description: '실질적인 투자 전략 및 팁',
  },
];

/**
 * 초기 태그 데이터 (필수 태그)
 * 추가 태그는 포스트 작성 시 자동 생성
 */
export const TAGS = [
  { id: uuidv4(), name: 'Apple', slug: 'apple' },
  { id: uuidv4(), name: 'Microsoft', slug: 'microsoft' },
  { id: uuidv4(), name: 'Tesla', slug: 'tesla' },
  { id: uuidv4(), name: 'Amazon', slug: 'amazon' },
  { id: uuidv4(), name: 'Google', slug: 'google' },
  { id: uuidv4(), name: 'Nvidia', slug: 'nvidia' },
  { id: uuidv4(), name: 'Meta', slug: 'meta' },
  { id: uuidv4(), name: 'Samsung', slug: 'samsung' },
  { id: uuidv4(), name: 'TSMC', slug: 'tsmc' },
  { id: uuidv4(), name: '기술주', slug: 'tech-stocks' },
  { id: uuidv4(), name: '성장주', slug: 'growth-stocks' },
  { id: uuidv4(), name: '배당주', slug: 'dividend-stocks' },
  { id: uuidv4(), name: '경기동향', slug: 'economic-indicators' },
  { id: uuidv4(), name: 'S&P500', slug: 'sp500' },
  { id: uuidv4(), name: 'NASDAQ', slug: 'nasdaq' },
  { id: uuidv4(), name: 'Dow Jones', slug: 'dow-jones' },
  { id: uuidv4(), name: '기술 실적발표', slug: 'tech-earnings' },
  { id: uuidv4(), name: 'AI', slug: 'ai' },
  { id: uuidv4(), name: '반도체', slug: 'semiconductors' },
  { id: uuidv4(), name: 'ESG', slug: 'esg' },
];

/**
 * 테스트용 사용자 데이터
 * 테스트 환경에서만 사용
 */
export const TEST_USER = {
  id: uuidv4(),
  email: 'admin@usstockstory.com',
  password: 'testpassword123!', // 테스트 비밀번호 (운영 환경에서는 변경 필요)
  name: '관리자',
  role: 'admin',
};

/**
 * 테스트용 포스트 데이터
 * 테스트 환경에서만 사용
 */
export const TEST_POSTS = [
  {
    title: 'Apple 2분기 실적 호실적, 아이폰 판매 급증의 이유는?',
    slug: 'apple-q2-earnings-iphone-sales',
    excerpt: 'Apple이 2분기 실적 발표에서 예상을 뛰어넘는 성과를 달성했다...',
    content_md: `# Apple 2분기 실적 분석

## 핵심 요약

Apple이 2분기 실적 발표에서 예상을 뛰어넘는 성과를 달성했습니다.

### 주요 지표

- **iPhone 매출**: +25% YoY
- **서비스 매출**: 역대 최고치
- **주당 순이익**: $2.18 (컨센서스 $2.05)

## 아이폰 판매 급증의 이유

1. **새로운 AI 기능**
   - 스마트 AI 어시스턴트
   - 실시간 번역 기능

2. **프리미엄 라인업**
   - Pro Max 모델 인기
   - 타이타늄 소재 채택

## 투자 전망

Apple의 AI 투자는 2024년 이후 성장의 핵심이 될 것으로 예상됩니다.

\`\`\`json
{
  "eps": "$2.18",
  "revenue": "$89.5B",
  "margin": "28.3%"
}
\`\`\`
`,
    content_html: '', // 시드 실행 시 자동 생성됨
    reading_time_mins: 5,
    cover_image_url: 'https://cdn.usstockstory.com/thumbnails/apple-q2.png',
    category_slug: '종목분석',
    tags: ['Apple', '기술주', '실적발표'],
    ai_source_urls: [
      'https://reuters.com/apple-earnings',
      'https://marketwatch.com/apple',
    ],
    is_ai_generated: false,
    is_published: true,
  },
  {
    title: 'Fed 금리 인상, 미국 주식시장에 미치는 영향',
    slug: 'fed-interest-rates-impact-stocks',
    excerpt: '연방준비제도(Fed)의 금리 인상이 미국 주식시장에 어떤 영향을 미치는지 분석합니다...',
    content_md: `# Fed 금리 인상 영향 분석

## 현재 상황

- **현재 기준금리**: 5.25% ~ 5.50%
- **다음 인상 예상**: 2024년 7월

## 주식시장 영향

### 단기 영향
- 기술주 약세
- 배당주 강세

### 장기 영향
- 경제 침체 우려
- 저금리 상승

## 투자 전략

금리 인상 시대에 맞는 포트폴리오 재조정 필요
`,
    content_html: '', // 자동 생성됨
    reading_time_mins: 4,
    cover_image_url: 'https://cdn.usstockstory.com/thumbnails/fed-rates.png',
    category_slug: '시장동향',
    tags: ['경기동향', 'S&P500'],
    ai_source_urls: ['https://federalreserve.gov', 'https://cnbc.com'],
    is_ai_generated: false,
    is_published: true,
  },
];
