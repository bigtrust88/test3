# React 컴포넌트 구조 및 명세

## 개요

Next.js 14 App Router 기반 컴포넌트 구조.
모든 컴포넌트는 TypeScript + Tailwind CSS 사용.

---

## 1. 공유 컴포넌트 (app/components/)

### 1.1 레이아웃 컴포넌트

#### Header.tsx
```typescript
// 위치: app/components/Header.tsx
// 사용: 모든 페이지

Props:
- currentCategory?: string  // 활성 카테고리 표시

State:
- isMenuOpen: boolean       // 모바일 메뉴
- isDarkMode: boolean       // 다크 모드

Features:
- 고정 네비게이션 (sticky top)
- 카테고리 드롭다운
- 검색 입력 창
- 다크/라이트 모드 토글
- 모바일 햄버거 메뉴

Children:
- Navigation (카테고리 목록)
- SearchBar
- ThemeToggle
```

#### Navigation.tsx
```typescript
// 위치: app/components/Navigation.tsx

Props:
- categories: Category[]
- activeCategory?: string

Data:
- 고정 5개 카테고리: 종목분석, 시장동향, 실적발표, ETF분석, 투자전략

Features:
- 호버 시 드롭다운
- 모바일: 접히는 메뉴
```

#### Sidebar.tsx
```typescript
// 위치: app/components/Sidebar.tsx
// 사용: 포스트 상세, 카테고리 페이지 (데스크탑만)

Props:
- tags: Tag[]
- latestPosts?: Post[]

Features:
- 태그 클라우드
- 최근 포스트 목록
- 뉴스레터 구독 폼
- 광고 스카이스크래퍼 (애드센스)
```

#### Footer.tsx
```typescript
// 위치: app/components/Footer.tsx

Features:
- 사이트 링크
- 소셜 미디어
- 저작권 정보
- SEO 관련 스키마 마크업
```

### 1.2 포스트 컴포넌트

#### PostCard.tsx
```typescript
// 위치: app/components/PostCard.tsx
// 사용: 홈, 카테고리 페이지, 검색 결과

Props:
{
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image_url: string
  reading_time_mins: number
  category: Category
  tags: Tag[]
  published_at: string
}

Features:
- 이미지 최적화 (next/image)
- 카드 호버 애니메이션
- 읽는 시간 표시
- 카테고리 배지
- 태그 목록
```

#### PostContent.tsx
```typescript
// 위치: app/components/PostContent.tsx
// 사용: 포스트 상세 페이지

Props:
{
  content_html: string
  title: string
  category: Category
  tags: Tag[]
  published_at: string
  author?: User
  is_ai_generated: boolean
}

Features:
- 마크다운 HTML 렌더링
- 문단 간 목차(TOC) 자동 생성
- 이미지 최적화
- 외부 링크 target="_blank" 처리
- 애드센스 in-article 광고 3개 삽입
  - 1번: 헤더 직후
  - 2번: 3번째 h2 후
  - 3번: 컨텐츠 끝
```

#### RelatedPosts.tsx
```typescript
// 위치: app/components/RelatedPosts.tsx
// 사용: 포스트 상세 페이지 하단

Props:
{
  posts: Post[]
  title?: string
}

Features:
- 관련 포스트 3개 카드
- 같은 카테고리 또는 태그 기반
- 가로 그리드
```

### 1.3 검색 및 필터 컴포넌트

#### SearchBar.tsx
```typescript
// 위치: app/components/SearchBar.tsx

State:
- query: string
- isLoading: boolean
- suggestions: string[]

Features:
- 실시간 검색 (디바운스)
- 최근 검색어 저장 (localStorage)
- 검색 제안 (자동완성)
- Enter 키 / 버튼 클릭 시 검색 페이지 이동
```

#### TagCloud.tsx
```typescript
// 위치: app/components/TagCloud.tsx

Props:
{
  tags: Tag[]
  maxSize?: number  // 기본값: 50
}

Features:
- 태그별 글꼴 크기 (post_count에 비례)
- 호버 시 색상 변경
- 클릭 시 /tag/[tag] 페이지로 이동
```

#### CategoryFilter.tsx
```typescript
// 위치: app/components/CategoryFilter.tsx

Props:
{
  categories: Category[]
  selectedCategory?: string
}

Features:
- 카테고리 선택 필터
- 라디오 버튼 또는 토글
```

### 1.4 UI 컴포넌트

#### Button.tsx
```typescript
// 위치: app/components/ui/Button.tsx
// Reusable 버튼

Props:
{
  variant: "primary" | "secondary" | "outline"
  size: "sm" | "md" | "lg"
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  className?: string
}
```

#### Input.tsx
```typescript
// 위치: app/components/ui/Input.tsx

Props:
{
  type: "text" | "email" | "password" | ...
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}
```

#### Modal.tsx
```typescript
// 위치: app/components/ui/Modal.tsx

Props:
{
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

Features:
- 배경 클릭 시 닫기
- ESC 키 닫기
- 스크롤 잠금
```

#### Badge.tsx
```typescript
// 위치: app/components/ui/Badge.tsx

Props:
{
  label: string
  variant: "primary" | "secondary" | "success" | "warning"
  size: "sm" | "md"
}
```

#### Skeleton.tsx
```typescript
// 위치: app/components/ui/Skeleton.tsx
// 로딩 상태 표시

Props:
{
  width: string | number
  height: string | number
  count?: number
  circle?: boolean
}

Features:
- 상자 / 원형 스켈레톤
- 애니메이션 (pulse)
```

#### Pagination.tsx
```typescript
// 위치: app/components/ui/Pagination.tsx

Props:
{
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  type: "number" | "cursor"  // cursor기반 또는 번호 기반
}

Features:
- 이전/다음 버튼
- 페이지 번호 (선택사항)
- 모바일 반응형
```

#### LoadingSpinner.tsx
```typescript
// 위치: app/components/ui/LoadingSpinner.tsx

Props:
{
  size: "sm" | "md" | "lg"
  color?: string
}
```

### 1.5 광고 컴포넌트

#### AdSenseUnit.tsx
```typescript
// 위치: app/components/AdSenseUnit.tsx
// 클라이언트 컴포넌트

Props:
{
  adSlot: string
  format: "auto" | "horizontal" | "vertical" | "rectangle"
  fullWidth?: boolean
}

Features:
- 반응형 광고 유닛
- window.adsbygoogle.push() 호출
- 특정 포맷 지원 (직사각형, 스카이스크래퍼, 리더보드)
- 에러 처리
```

#### AdSenseHead.tsx
```typescript
// 위치: app/components/AdSenseHead.tsx
// next/script 사용

Features:
- AdSense 스크립트 로드 (strategy="afterInteractive")
- 페이지 레벨 광고 활성화
```

---

## 2. 퍼블릭 페이지 컴포넌트 (app/(public)/)

### 2.1 홈 페이지 (app/(public)/page.tsx)

**주요 섹션**:

#### MarketWidget.tsx
```typescript
// 위치: app/components/MarketWidget.tsx

State:
- indices: {symbol, name, price, change, changePercent}[]
- isLoading: boolean
- lastUpdated: Date

Data Source:
- /api/market-data (캐시: 60초)

Features:
- 실시간 갱신 (useEffect with setInterval)
- S&P500, NASDAQ, DOW, VIX, 국채금리
- 상승/하락 색상 표시
- 시장 마감 시간 표시
```

#### LatestPostsGrid.tsx
```typescript
// 위치: app/components/LatestPostsGrid.tsx

Props:
- posts: Post[]
- isLoading?: boolean

Features:
- 최신 포스트 3~6개 카드 그리드
- 스켈레톤 로딩
- 반응형 (모바일: 1열, 태블릿: 2열, 데스크탑: 3열)
```

#### CategorySection.tsx
```typescript
// 위치: app/components/CategorySection.tsx
// 각 카테고리별 섹션 (반복)

Props:
{
  category: Category
  posts: Post[]
}

Features:
- 카테고리명 + 설명
- 최신 포스트 3개
- "더보기" 링크 → /category/[slug]
```

### 2.2 카테고리 페이지 (app/(public)/[category]/page.tsx)

**주요 컴포넌트**:

#### CategoryHeader.tsx
```typescript
// 위치: app/components/CategoryHeader.tsx

Props:
{
  category: Category
  postCount: number
}

Features:
- 카테고리명 (아이콘 포함)
- 설명
- 포스트 개수
```

#### PostsList.tsx
```typescript
// 위치: app/components/PostsList.tsx

Props:
{
  posts: Post[]
  isLoading: boolean
  sortBy: "latest" | "popular"
  view: "grid" | "list"
}

Features:
- 포스트 리스트 또는 그리드
- 정렬 옵션
- 필터 지원
- 페이지네이션 (cursor 기반)
- "더 로드" 버튼 (모바일)
```

### 2.3 포스트 상세 페이지 (app/(public)/post/[slug]/page.tsx)

**주요 컴포넌트**:

#### PostHeader.tsx
```typescript
// 위치: app/components/PostHeader.tsx

Props:
{
  post: Post
}

Features:
- 제목
- 커버 이미지
- 메타데이터 (카테고리, 날짜, 읽는 시간, 작가)
- 애드센스 광고 #1 (직후)
```

#### TableOfContents.tsx
```typescript
// 위치: app/components/TableOfContents.tsx

Props:
{
  content_html: string
  sticky?: boolean
}

Features:
- h2, h3 헤딩 자동 추출
- 클릭 시 해당 섹션으로 스크롤
- 데스크탑 sticky 사이드바 (고정)
- 모바일 모달 토글
```

#### CommentSection.tsx
```typescript
// 위치: app/components/CommentSection.tsx
// Giscus 임베드

Props:
{
  postId: string
  slug: string
}

Features:
- Giscus GitHub Discussions 기반 댓글
- 다크모드 자동 감지
- 반응형
```

### 2.4 검색 페이지 (app/(public)/search/page.tsx)

**주요 컴포넌트**:

#### SearchResults.tsx
```typescript
// 위치: app/components/SearchResults.tsx

Props:
{
  query: string
  results: Post[]
  totalCount: number
}

Features:
- 검색어 강조 표시
- 결과 개수 표시
- 카테고리별 그룹핑
- 페이지네이션
```

---

## 3. 관리자 페이지 컴포넌트 (app/(admin)/admin/)

### 3.1 관리자 레이아웃

#### AdminLayout.tsx
```typescript
// 위치: app/(admin)/admin/layout.tsx

Features:
- 좌측 사이드바 네비게이션
- 우측 헤더 (알림, 프로필)
- JWT 토큰 검증 (middleware)
- 권한 확인 (admin only)
```

#### AdminSidebar.tsx
```typescript
// 위치: app/components/AdminSidebar.tsx

Navigation Items:
- 대시보드
- 포스트 관리
- AI 로그
- 스케줄러
- AdSense
- 설정

Features:
- 활성 페이지 하이라이트
- 모바일 토글 메뉴
```

### 3.2 대시보드 (app/(admin)/admin/page.tsx)

**주요 컴포넌트**:

#### StatsCard.tsx
```typescript
// 위치: app/components/StatsCard.tsx

Props:
{
  title: string
  value: number | string
  trend?: number
  icon?: ReactNode
  color?: string
}

Features:
- 주요 지표 카드
- 증감율 표시
- 트렌드 화살표
```

#### PostsCountCard.tsx
```typescript
// 위치: app/components/dashboard/PostsCountCard.tsx

Features:
- "오늘 발행: 2/3"
- 원형 프로그레스
- 남은 시간까지 표시
```

#### TrafficChart.tsx
```typescript
// 위치: app/components/dashboard/TrafficChart.tsx

Data Source:
- /api/admin/dashboard

Features:
- 일별 조회수 차트 (이번주)
- 선형 차트 (Recharts 또는 Chart.js)
- 반응형
```

#### AIStatsCard.tsx
```typescript
// 위치: app/components/dashboard/AIStatsCard.tsx

Features:
- AI 포스트 성공률 (%)
- 최근 3회 실행 현황
- "상세보기" 링크 → /admin/ai-logs
```

#### LatestExecutions.tsx
```typescript
// 위치: app/components/dashboard/LatestExecutions.tsx

Data Source:
- /api/admin/ai-logs?limit=5

Features:
- 최근 n8n 실행 로그
- 상태 배지 (성공/실패)
- 포스트 링크
- 더보기 링크
```

### 3.3 포스트 관리 (app/(admin)/admin/posts/page.tsx)

**주요 컴포넌트**:

#### PostsTable.tsx
```typescript
// 위치: app/components/PostsTable.tsx

Columns:
- 제목
- 카테고리
- 작성자
- 날짜
- 상태 (발행/초안)
- 액션 (수정/삭제)

Features:
- 데이터 테이블 (Headless UI)
- 정렬 가능
- 필터 지원
- 페이지네이션
- 삭제 시 모달 확인
```

#### PostsToolbar.tsx
```typescript
// 위치: app/components/PostsToolbar.tsx

Features:
- "+ 새 포스트" 버튼
- 필터 드롭다운 (상태, 카테고리)
- 정렬 옵션
- 검색 입력
```

### 3.4 포스트 작성/수정 (app/(admin)/admin/posts/new/, /[id]/edit/)

**주요 컴포넌트**:

#### PostForm.tsx
```typescript
// 위치: app/components/forms/PostForm.tsx

Fields:
- title
- category_id (select)
- tags (multi-select)
- cover_image_url (file upload)
- excerpt (textarea)
- content_md (markdown editor)
- is_published (checkbox)

Features:
- React Hook Form 기반
- Zod 검증
- 실시간 마크다운 미리보기
- 이미지 업로드 (preview)
- 저장 상태 표시
```

#### MarkdownEditor.tsx
```typescript
// 위치: app/components/MarkdownEditor.tsx

Props:
{
  value: string
  onChange: (value: string) => void
}

Features:
- @uiw/react-md-editor 사용
- 스플릿 뷰 (입력 + 미리보기)
- 마크다운 포맷팅 버튼
- 신택스 강조
```

#### ImageUpload.tsx
```typescript
// 위치: app/components/ImageUpload.tsx

Features:
- 파일 선택 / 드래그 앤 드롭
- 이미지 미리보기
- 크기 제한 (2MB)
- 포맷 검증 (jpg, png, webp)
```

### 3.5 AI 로그 (app/(admin)/admin/ai-logs/page.tsx)

**주요 컴포넌트**:

#### AILogsTable.tsx
```typescript
// 위치: app/components/AILogsTable.tsx

Columns:
- 시간
- n8n ID
- 상태 (성공/실패)
- 포스트
- 토큰 사용
- 액션 (상세보기)

Features:
- 자동 새로고침 (10초)
- 상태별 색상 코드
- 필터 (상태, 기간)
```

#### LogDetailModal.tsx
```typescript
// 위치: app/components/LogDetailModal.tsx

Features:
- n8n 실행 세부정보
- 크롤링 URL 목록
- Claude 토큰 정보
- 에러 메시지 (있을 경우)
- 생성된 포스트 링크
```

### 3.6 스케줄러 (app/(admin)/admin/scheduler/page.tsx)

**주요 컴포넌트**:

#### ScheduleCard.tsx
```typescript
// 위치: app/components/ScheduleCard.tsx

Props:
{
  schedule: Schedule
}

Features:
- 스케줄 시간
- 상태 (활성/비활성)
- 마지막 실행 시간
- 성공률 (%)
- "수동 실행" 버튼
- "수정" 버튼
```

#### TriggerModal.tsx
```typescript
// 위치: app/components/TriggerModal.tsx

Features:
- n8n 워크플로우 즉시 실행
- 진행 상태 표시
- 성공/실패 메시지
```

### 3.7 AdSense 대시보드 (app/(admin)/admin/adsense/page.tsx)

**주요 컴포넌트**:

#### RevenueChart.tsx
```typescript
// 위치: app/components/adsense/RevenueChart.tsx

Data Source:
- /api/admin/adsense

Features:
- 월간 수익 차트
- 일별 세부사항
- 수익 통계
```

#### AdUnitsPerformance.tsx
```typescript
// 위치: app/components/adsense/AdUnitsPerformance.tsx

Features:
- 광고 유닛별 성과 테이블
- 노출, 클릭, CTR, 수익
```

---

## 4. 공유 Hooks

### useAuth.ts
```typescript
// 위치: app/hooks/useAuth.ts

Features:
- 현재 사용자 정보 조회
- 로그인 여부 확인
- 로그아웃 함수
```

### usePost.ts
```typescript
// 위치: app/hooks/usePost.ts

Features:
- 포스트 단일 조회
- 포스트 목록 조회
- SWR 캐싱
```

### useDarkMode.ts
```typescript
// 위치: app/hooks/useDarkMode.ts

Features:
- 다크모드 토글
- localStorage 동기화
- Tailwind dark class 적용
```

### useDebounce.ts
```typescript
// 위치: app/hooks/useDebounce.ts

Features:
- 검색어 디바운싱
- 타이머 관리
```

---

## 5. 컴포넌트 트리 예시

### 홈 페이지
```
page.tsx
├── Header
│   ├── Navigation
│   ├── SearchBar
│   └── ThemeToggle
├── MarketWidget
├── LatestPostsGrid
│   └── PostCard (x3~6)
├── CategorySection (x5)
│   └── PostCard (x3)
├── TagCloud
├── Footer
└── AdSenseUnit (sidebar)
```

### 포스트 상세
```
page.tsx
├── Header
├── PostHeader
├── PostContent
│   ├── AdSenseUnit #1
│   ├── AdSenseUnit #2
│   └── AdSenseUnit #3
├── Sidebar
│   ├── TableOfContents
│   ├── TagCloud
│   └── AdSenseUnit (skyscraper)
├── RelatedPosts
├── CommentSection (Giscus)
└── Footer
```

### 관리자 대시보드
```
layout.tsx (AdminLayout)
├── AdminSidebar
├── AdminHeader
└── page.tsx
    ├── StatsCard (x4)
    ├── PostsCountCard
    ├── TrafficChart
    ├── AIStatsCard
    └── LatestExecutions
```

---

## 6. 컴포넌트 설계 원칙

### 6.1 Props 설계
- 최소한의 props 전달
- Props 타입 명시 (TypeScript)
- 선택사항은 기본값 제공

### 6.2 상태 관리
- 간단한 상태: useState
- 복잡한 상태: Zustand 고려
- 서버 데이터: SWR or React Query

### 6.3 성능
- React.memo 사용 (재렌더링 최적화)
- 동적 import (admin 페이지)
- 이미지 최적화 (next/image)

### 6.4 접근성
- 시맨틱 HTML
- ARIA 속성
- 키보드 네비게이션

---

## 7. 주요 라이브러리

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "tailwindcss": "^3.3.0",
    "next-themes": "^0.2.1",
    "@uiw/react-md-editor": "^11.0.0",
    "swr": "^2.0.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "zustand": "^4.4.0",
    "recharts": "^2.10.0",
    "clsx": "^2.0.0"
  }
}
```
