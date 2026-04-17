# USStockStory 전체 아키텍처

> **현재 상태: 운영 중** — 매일 09:00 KST 자동 포스팅 작동 중
> 도메인: `bigtrust.site` / API: `api.bigtrust.site`
> AdSense ID: `ca-pub-3811219422484638`

---

## 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| Frontend | Next.js 14 (App Router) | Vercel 배포, SSR/ISR |
| Backend | NestJS | Railway 배포 |
| Database | MySQL | Railway 플러그인 |
| 자동 포스팅 | GitHub Actions + Claude API | 매일 09:00 KST |
| 썸네일 | Node.js Canvas | Unsplash 배경 + 텍스트 합성 |
| 이미지 CDN | Cloudflare R2 | 썸네일 + 본문 이미지 저장 |
| AI | Anthropic Claude (claude-sonnet-4-6) | 주제 선정 + 본문 작성 |

---

## 배포 구조

```
사용자
  │
Cloudflare (DNS)
  ├── bigtrust.site        → Vercel (Next.js)
  └── api.bigtrust.site   → Railway (NestJS + MySQL)
                                    └── Cloudflare R2 (이미지)

GitHub Actions (cron 매일 09:00 KST)
  └── scripts/auto_post.js
        └── Anthropic Claude API
```

---

## 자동 포스팅 파이프라인

```
GitHub Actions 실행 (09:00 KST)
  │
  ├─ 1. api.bigtrust.site 로그인 (fresh JWT)
  ├─ 2. 기존 포스팅 전체 조회
  │       ├─ 카테고리 분포 분석 → 포스팅 수 적은 카테고리 우선
  │       ├─ 기존 포스트 제목 목록 → 중복 주제 방지
  │       └─ content_md의 thumbnail_bg 주석 → 사용된 사진 추적
  ├─ 3. Claude API → 주제 3개 선정
  │       ├─ POSTING_STANDARDS.md 기준 적용
  │       ├─ THUMBNAIL_GENERATION-8.md 기준 적용
  │       └─ 미사용 Unsplash 사진 목록 전달 → 주제에 맞는 사진 선택
  ├─ 4. Claude API → 포스트 본문 생성 (×3)
  │       └─ E-E-A-T 기준, 1000~1500 words, 영문
  ├─ 5. Node.js Canvas → 썸네일 합성 (×3, 1200×630px)
  │       └─ Unsplash 배경 + 다크 오버레이 + 텍스트 레이어
  ├─ 6. Cloudflare R2 → 썸네일 업로드 (×3)
  ├─ 7. POST /api/posts → 게시 (×3)
  ├─ 8. generate_sitemap.js → sitemap.xml 재생성
  └─ 9. git commit & push → sitemap.xml 자동 업데이트
```

---

## 페이지 구조

### Public Pages
```
/                          홈 (최신 포스트 카드 그리드)
/[category]/               카테고리별 목록 (5개 카테고리)
/post/[slug]/              포스트 상세
/tag/[tag]/                태그별 목록
/search/                   검색
```

### 5개 카테고리
| Slug | 설명 |
|------|------|
| `earnings` | 실적 발표 분석 |
| `stock-analysis` | 종목 심층 분석 |
| `investment-strategy` | 투자 전략 |
| `market-trend` | 시장 동향 |
| `etf-analysis` | ETF 분석 |

### Admin Pages
```
/admin/                    대시보드
/admin/posts/              포스트 관리
/admin/posts/new/          직접 글쓰기
/admin/posts/[id]/edit/    포스트 수정
```

---

## 핵심 규칙 (POSTING_STANDARDS.md / THUMBNAIL_GENERATION-8.md)

### 포스팅 규칙
- **언어**: 영문 전용 (Google 검색 타겟)
- **길이**: 1,000~1,500 words
- **E-E-A-T**: 최소 2개 출처 인용, 날짜 명시, Disclaimer 필수
- **카테고리 균형**: 포스팅 수 적은 카테고리 우선 선정
- **중복 방지**: 기존 포스트 제목 50% 이상 겹치면 폐기

### 썸네일 규칙
- **하락 차트 이미지 금지** (photo-1611974789855 등)
- **이모지 금지** (Canvas에서 깨짐)
- **동일 사진 중복 금지**: content_md에 `<!-- thumbnail_bg: PHOTO_ID -->` 주석으로 추적
- **사진 선택**: 미사용 사진 목록에서 주제에 맞는 것 선택 (Claude가 결정)
- **cover_image_url**: 반드시 R2 URL (Unsplash 직접 사용 금지)

---

## 주요 파일

| 파일 | 역할 |
|------|------|
| `scripts/auto_post.js` | 자동 포스팅 메인 스크립트 |
| `generate_sitemap.js` | 사이트맵 재생성 스크립트 |
| `.github/workflows/daily-post.yml` | GitHub Actions 워크플로우 |
| `POSTING_STANDARDS.md` | 포스팅 기준 (E-E-A-T, 구조, 메타데이터) |
| `THUMBNAIL_GENERATION-8.md` | Canvas 썸네일 합성 명세 |
| `AUTO_POSTING_SYSTEM.md` | 자동 포스팅 시스템 상세 문서 |
| `frontend/public/sitemap.xml` | 사이트맵 (포스팅 시 자동 갱신) |
| `backend/.env.local` | 로컬 환경변수 (API 키 포함) |

---

## GitHub Secrets (3개)

| Secret | 내용 |
|--------|------|
| `BIGTRUST_EMAIL` | admin@bigtrust.site |
| `BIGTRUST_PASSWORD` | 관리자 비밀번호 |
| `ANTHROPIC_API_KEY` | Claude API 키 |

---

## 로컬 실행

```bash
# 테스트 포스팅 1개
POST_COUNT=1 \
  BIGTRUST_EMAIL="admin@bigtrust.site" \
  BIGTRUST_PASSWORD="Admin123!" \
  ANTHROPIC_API_KEY="$(grep ANTHROPIC_API_KEY backend/.env.local | cut -d= -f2)" \
  node scripts/auto_post.js

# 사이트맵 재생성
BIGTRUST_EMAIL="admin@bigtrust.site" BIGTRUST_PASSWORD="Admin123!" \
  node generate_sitemap.js
```

---

## 비용 구조

| 서비스 | 비용 |
|--------|------|
| Vercel | 무료 |
| Railway (NestJS + MySQL) | ~$5/월 |
| Cloudflare R2 | 무료 (10GB 이하) |
| Claude API | ~$2~3/월 (3포스트 × 30일) |
| GitHub Actions | 무료 (public repo 또는 2,000분/월) |
| **합계** | **~$7~8/월** |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-16 | 최초 구축 완료 (NestJS + Next.js + MySQL) |
| 2026-04-16 | n8n 대신 GitHub Actions로 자동 포스팅 구현 |
| 2026-04-16 | Canvas 썸네일 합성 + R2 업로드 구현 |
| 2026-04-16 | 카테고리 영문 표시, 날짜 en-US 포맷 수정 |
| 2026-04-17 | 카테고리 균형 선정 규칙 추가 |
| 2026-04-17 | 썸네일/본문 이미지 중복 방지 로직 구현 |
| 2026-04-17 | thumbnail_bg 주석으로 사진 추적 문제 해결 |
| 2026-04-17 | sitemap.xml 자동 생성 + 포스팅 시 자동 커밋 |
| 2026-04-17 | Google Search Console 사이트맵 등록 |
