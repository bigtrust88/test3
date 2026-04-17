# USStockStory 자동 포스팅 시스템

> 매일 09:00 KST GitHub Actions로 자동 실행. Claude API가 주제 선정 + 본문 작성, Canvas가 썸네일 합성.

---

## 1. 시스템 구조

```
GitHub Actions (cron 0 0 * * *)
  └─ node scripts/auto_post.js
        ├─ 1. 로그인 (api.bigtrust.site)
        ├─ 2. 기존 포스팅 목록 조회
        ├─ 3. 카테고리 & 태그 맵 조회
        ├─ 4. Claude API → 주제 3개 선정
        ├─ 5. Claude API → 포스트 본문 생성 (×3)
        ├─ 6. Canvas → 썸네일 합성 (×3)
        ├─ 7. R2 → 썸네일 업로드 (×3)
        └─ 8. POST /api/posts → 게시 (×3)
```

---

## 2. GitHub Actions 설정

**파일**: `.github/workflows/daily-post.yml`
**스케줄**: `cron: '0 0 * * *'` (매일 09:00 KST)
**수동 실행**: GitHub UI → Actions → `workflow_dispatch`

### 필수 Secrets (3개)

| Secret | 설명 |
|--------|------|
| `BIGTRUST_EMAIL` | api.bigtrust.site 관리자 이메일 |
| `BIGTRUST_PASSWORD` | 관리자 비밀번호 |
| `ANTHROPIC_API_KEY` | Claude API 키 (sk-ant-...) |

### Ubuntu 시스템 패키지 (Canvas 빌드용)
```
libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

---

## 3. 주요 파일

| 파일 | 역할 |
|------|------|
| `scripts/auto_post.js` | 메인 자동 포스팅 스크립트 |
| `POSTING_STANDARDS.md` | E-E-A-T 기준, 포스팅 구조, 메타데이터 규칙 |
| `THUMBNAIL_GENERATION-8.md` | Canvas 썸네일 합성 명세 |
| `.github/workflows/daily-post.yml` | GitHub Actions 워크플로우 |

---

## 4. 주제 선정 규칙

### 카테고리 균형 (Category Balance)
- 실행 시 기존 포스트의 카테고리 분포를 집계
- **포스팅 수가 적은 카테고리를 우선 선택**
- 3개 주제 중 최소 2개는 가장 적은 카테고리에서 선택

| 카테고리 | Slug |
|----------|------|
| Earnings | `earnings` |
| Stock Analysis | `stock-analysis` |
| Investment Strategy | `investment-strategy` |
| Market Trend | `market-trend` |
| ETF Analysis | `etf-analysis` |

### 중복 방지 (Duplicate Prevention)
- 기존 포스트 제목 목록을 Claude에게 전달
- 동일 회사 + 동일 이벤트 포스팅 절대 금지
- 주제 겹침 50% 이상이면 폐기 후 재선정

---

## 5. 사진 선택 규칙

### 핵심 원칙
1. **포스트 주제/컨셉에 맞는 사진** 선택
2. **기존 포스트에서 이미 쓰인 사진은 재사용 금지**
3. 같은 실행(run) 내 3개 포스트는 서로 다른 썸네일 배경 사진 사용

### 동작 방식
1. 기존 포스트 `content_md`에서 사용된 Unsplash photo ID 추출
2. 미사용 사진 목록(ID + 설명)을 Claude에게 전달
3. Claude가 목록 안에서 주제에 가장 맞는 사진 선택 (`bg_photo_id`, `body_photo_id`)

### 사진 목록 (PHOTOS)

| Photo ID | 설명 |
|----------|------|
| `1518770660439-4636190af475` | circuit board / semiconductor chip |
| `1526374965328-7f61d4dc18c5` | GPU / graphics card / AI hardware |
| `1558494949-ef010cbdcc31` | server rack / data center / cloud |
| `1590283603385-17ffb3a7f29f` | upward stock chart / green market gains |
| `1486406146926-c627a92ad1ab` | bank building / financial institution |
| `1522869635100-9f4c5e86aa37` | streaming / entertainment / media screen |
| `1581091226825-a6a2a5aee158` | laptop / technology / software |
| `1593941707882-a5bba14938c7` | electric vehicle / EV / Tesla |
| `1532187863486-abf9dbad1b69` | biotech / laboratory / pharmaceutical |
| `1466611653911-95081537e5b7` | energy / solar / wind / oil |
| `1441986300917-64674bd600d8` | retail / shopping / consumer goods |
| `1544197150-b99a580bb7a8` | cloud computing / internet / SaaS |

### 절대 사용 금지
- `photo-1611974789855-9c2a0a7236a3` — 하락 차트 (declining candlestick chart)
- 우하향 곡선, 빨간 하락 캔들 지배적인 모든 이미지

---

## 6. 썸네일 생성 (Canvas)

**규격**: 1200 × 630px PNG → R2 업로드 → `cover_image_url`

### 레이어 구조
1. Unsplash 배경 사진
2. 어두운 그라디언트 오버레이 (`rgba(0,0,0,0.55)` → `rgba(0,0,0,0.80)`)
3. Sentiment 글로우 (좌하단 radial): bullish=#10B981 / bearish=#EF4444 / neutral=#3B82F6
4. Badge (좌상단): `PRE-MARKET` / `ANALYSIS` / `MARKET CLOSE` — **이모지 금지**
5. 로고 (우상단): `USStockStory`
6. 메인 헤드라인 (60px Bold, 최대 2줄, max 44자)
7. 서브텍스트 (30px, #CBD5E1, max 30자)
8. 구분선
9. 태그 + 날짜 푸터

---

## 7. 포스트 본문 규칙 (E-E-A-T)

- **길이**: 1,000–1,500 단어 (영문)
- **구조**: Overview → Key Metrics 테이블 → 분석 섹션 2개 → Risk Factors → Investment Outlook
- **본문 이미지**: content_md 중간에 정확히 1개 (Unsplash stable URL)
- **출처**: 최소 2개 명시 (FactSet, Bloomberg, Reuters, CNBC 등)
- **Disclaimer**: 매 포스트 하단 필수

---

## 8. API 필드 명세 (CreatePostDto)

```json
{
  "title": "string (60자 이내)",
  "slug": "string (영문 kebab-case)",
  "excerpt": "string (160자 이내)",
  "content_md": "string (마크다운)",
  "content_html": "string (marked로 변환)",
  "category_id": "UUID",
  "tag_ids": ["UUID", ...],
  "cover_image_url": "https://pub-xxx.r2.dev/images/xxx.png",
  "is_published": true,
  "reading_time_mins": 5
}
```

> ⚠️ `thumbnail_headline`, `thumbnail_subtext`, `trigger_type` 등은 DTO에 없음 → 전송 시 400 에러

---

## 9. 로컬 테스트 실행

```bash
# 1개만 테스트 포스팅
POST_COUNT=1 BIGTRUST_EMAIL="admin@bigtrust.site" BIGTRUST_PASSWORD="xxx" ANTHROPIC_API_KEY="sk-ant-xxx" node scripts/auto_post.js

# 3개 전체 실행
BIGTRUST_EMAIL="..." BIGTRUST_PASSWORD="..." ANTHROPIC_API_KEY="..." node scripts/auto_post.js
```

---

## 10. 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| 401 Login failed | Secrets 값 오류 | GitHub Settings → Secrets 확인 |
| 400 Bad Request | DTO에 없는 필드 전송 | API 필드 명세 섹션 참고 |
| Canvas 빌드 오류 | 시스템 라이브러리 누락 | workflow에 apt-get 스텝 확인 |
| 썸네일에 하락 차트 | photo_id 잘못 선택 | PHOTOS 목록에서 금지 ID 제거 |
| 동일 썸네일 반복 | photo dedup 미작동 | content_md Unsplash URL 확인 |
