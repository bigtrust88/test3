# 미국주식 블로그 전체 아키텍처 플랜

## Context
기존 Hugo + PaperMod 정적 블로그(TEST2)를 완전히 새로운 동적 스택으로 재구축.
목표: AI 자동 하루 3회 발행 + 실시간 주가 위젯 + 완전한 관리자 대시보드 + 애드센스 수익화.
AdSense 승인 ID: `ca-pub-3811219422484638` / 도메인: `usstockstory.com`

---

## 기술 스택 확정

| 영역 | 기술 | 이유 |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SEO SSR/ISR, 애드센스 최적화 |
| Backend | Nest.js | n8n REST API 연동, 인증/권한 체계 |
| Database | MySQL (Railway) | 관계형 구조, Korean ngram 풀텍스트 검색 |
| AI 자동화 | n8n + Claude API | 스케줄 트리거, 뉴스크롤링 파이프라인 |
| 댓글 | Giscus (1단계) → 자체 댓글(2단계) | 무료, 광고없음, 애드센스 충돌 없음 |
| 배포 | Vercel + Railway + Cloudflare | 비용 최적화, 서울 PoP 캐싱 |
| 주가 위젯 | TradingView embed (1단계) → Yahoo Finance API (2단계) | 빠른 시작, 나중에 자체 구현 |

---

## 배포 아키텍처

```
한국 사용자
    |
Cloudflare (DNS + CDN, 서울 PoP)
    |
    ├── usstockstory.com → Vercel (Next.js 14)
    │       └── ISR 캐시: 포스트/카테고리 페이지
    │
    └── api.usstockstory.com → Railway (NestJS)
            ├── MySQL (Railway plugin, 내부 네트워크)
            └── n8n (Railway 서비스)
                    └── Claude API (Anthropic)
```

**비용 예상:**
- Vercel: 무료 (100GB/월 트래픽)
- Railway: $5/월 (NestJS + MySQL)
- Claude API: ~$2/월 (3포스트/일 × 30일)
- n8n: Railway 포함 또는 별도 VPS $6/월

---

## 페이지 구조

### Public Pages (독자용)
```
/ (홈)
├── 실시간 주가 위젯바 (S&P500, NASDAQ, DOW, VIX, 국채금리)
├── 최신 포스트 카드 그리드
└── 카테고리별 최신 3개씩

/[category]/              → 종목분석 | 시장동향 | 실적발표 | ETF분석 | 투자전략
/post/[slug]/             → 포스트 상세 (애드센스 3곳 삽입)
/tag/[tag]/               → 태그별 모아보기
/search/                  → 한국어 검색 (MySQL ngram)
```

### Admin Pages (관리자용)
```
/admin/                   → 대시보드 (트래픽 + 오늘 발행 현황 + AI 성공률)
/admin/posts/             → 포스트 목록/관리 (발행/비공개/삭제)
/admin/posts/new/         → 직접 글쓰기 (Markdown 에디터)
/admin/posts/[id]/edit/   → 포스트 수정
/admin/ai-logs/           → n8n 자동화 실행 로그 모니터링
/admin/scheduler/         → 스케줄 관리 + 수동 트리거 버튼
/admin/adsense/           → 애드센스 수익 현황 (AdSense API)
/admin/settings/          → 사이트 설정
```

---

## n8n 자동화 플로우

### 하루 3회 실행 시간 (KST)
- 08:00 — 프리마켓 브리핑 (미국 전날 마감 + 선물 동향)
- 14:00 — 특정 종목/ETF 심층 분석
- 22:00 — 미국 장 마감 후 리캡

### 워크플로우 파이프라인
```
[Schedule Trigger]
    ↓
[RSS 뉴스 크롤링] → Reuters, MarketWatch, Seeking Alpha 공개 피드
    ↓
[중복 제거] → ai_post_logs 테이블과 URL 비교
    ↓
[Claude API 호출]
  - System: 한국어 미국주식 블로거 역할, JSON 출력 포맷 지정
  - User: 크롤링된 뉴스 헤드라인 + 발행 유형 (아침/점심/저녁)
  - 출력: { title, slug, excerpt, content_md, tags[], category_slug }
    ↓
[NestJS 내부 API] → POST /api/internal/posts/publish
    ↓
[Next.js ISR 재검증] → revalidatePath 트리거
    ↓
[Discord/Telegram 알림] → "포스트 발행 완료"
    ↓
[ai_post_logs 기록] → 성공/실패 모두 기록
```

---

## MySQL 스키마 (핵심 테이블)

### posts
```sql
id, uuid, title, slug, excerpt,
content_md (Markdown 원본),
content_html (사전 렌더링),
category_id, author_id (NULL=AI생성),
cover_image_url, reading_time_mins,
is_published, is_ai_generated,
ai_source_urls (JSON),
published_at, created_at, updated_at, deleted_at
FULLTEXT INDEX ft_search(title, excerpt) WITH PARSER ngram
```

### ai_post_logs (자동화 감사 추적)
```sql
id, post_id, n8n_execution_id,
trigger_time, crawled_urls (JSON),
claude_prompt_tokens, claude_completion_tokens,
claude_model, status (pending/success/failed),
error_message, created_at
```

### 기타 테이블
- `categories` — 5개 고정 카테고리 (slug, name_ko)
- `tags` — 유동 태그 (자동 생성)
- `post_tags` — 다대다 연결
- `users` — 관리자만 (admin/editor 역할)
- `site_settings` — 키-값 설정 저장소
- `comments` — 2단계에서 자체 댓글 구현

---

## 애드센스 삽입 위치 (포스트 상세)

1. 포스트 헤더 직후 (본문 시작 전) — 반응형 직사각형
2. 본문 3번째 문단 후 — In-article 포맷
3. 본문 끝 (댓글 전) — 리더보드 또는 직사각형
4. 데스크탑 사이드바 (sticky) — 스카이스크래퍼

Next.js: `next/script strategy="afterInteractive"` 로 AdSense 스크립트 로드 (Core Web Vitals 보호)

---

## SEO 전략

- **구조화 데이터**: Article JSON-LD (Google Discover 노출에 필수)
- **OG 이미지**: Next.js ImageResponse로 동적 생성 (카카오톡 링크 미리보기)
- **한국어 검색**: MySQL ngram 파서 (`ngram_token_size=2`)
- **네이버**: Search Advisor 등록 (네이버 검색 트래픽)
- **사이트맵**: NestJS 동적 생성 → Next.js sitemap.ts

---

## 디자인 방향 (junghyeonsu.com 스타일)

- 깔끔한 카드형 레이아웃 + 넓은 여백
- 상단 고정 네비게이션 + 카테고리 드롭다운
- 다크/라이트 모드 (next-themes, finance 사이트 특성상 다크 기본)
- 포스트에 읽는 시간, 날짜, 카테고리 표시
- 태그 클라우드 사이드바
- 실시간 주가 위젯바 (홈 상단)

---

## 구현 단계

### 1단계 (1-2주): 기반 구축
- Railway: MySQL 프로비전 (ngram 설정)
- NestJS: auth, posts CRUD, 내부 API
- Next.js: 퍼블릭 레이아웃, 홈, 포스트 상세, 애드센스
- Vercel + Railway + Cloudflare 배포

### 2단계 (3주차): 자동화
- n8n 설치 및 3개 워크플로우 구성
- RSS 크롤링 + Claude API 연동
- NestJS 내부 발행 API + ISR 재검증
- Discord 알림

### 3단계 (4주차): 관리자 + 디자인 완성
- 관리자 대시보드 전체
- Markdown 에디터 (수동 글쓰기)
- 다크/라이트 모드
- TradingView 주가 위젯
- 네이버 Search Advisor 등록

### 4단계 (2개월 이후): 고도화
- Yahoo Finance API 직접 연동 (TradingView 대체)
- 자체 댓글 시스템 (NestJS + MySQL)
- AdSense API 수익 대시보드
- 관련 포스트 추천 알고리즘
- 이메일 뉴스레터 (Resend.com)

---

## 참고 파일 (기존 Hugo 프로젝트)
- `TEST2/investment-blog/layouts/partials/adsense-head.html` — AdSense 스크립트 패턴
- `TEST2/investment-blog/layouts/partials/adsense-ad-unit.html` — 광고 단위 패턴
- `TEST2/investment-blog/layouts/_default/single.html` — 광고 삽입 위치 참고
