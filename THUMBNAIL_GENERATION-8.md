# THUMBNAIL_GENERATION-8.md
# 썸네일 자동 생성 상세 명세

## 개요

n8n 워크플로우에서 Claude API 포스트 생성 직후,
각 포스트에 맞는 썸네일(Cover Image)을 자동으로 생성하여
NestJS `cover_image_url` 필드에 저장한다.

- 썸네일 규격: **1200 × 630px** (16:9, OG Image 표준)
- 생성 방식: **Bannerbear API** (또는 Cloudflare Images + HTML Canvas)
- 저장 위치: CDN (`cdn.usstockstory.com/thumbnails/`)
- 연동 시점: Claude API 응답 이후, NestJS 발행 API 호출 이전

---

## 1. 썸네일 디자인 시스템

기존 DESIGN-4.md 컬러/타이포 시스템과 완전히 일치시킨다.

### 1.1 컬러 팔레트

| 용도 | 색상 | Hex |
|---|---|---|
| 배경 (기본) | Navy Dark | `#0F172A` |
| 배경 (라이트) | Light Gray | `#F8FAFC` |
| 강조 텍스트 (상승) | Stock Green | `#10B981` |
| 강조 텍스트 (하락) | Stock Red | `#EF4444` |
| CTA / 링크 | Primary Blue | `#3B82F6` |
| 경고 / 주의 | Warning Yellow | `#FBBF24` |
| 본문 텍스트 | White | `#FFFFFF` |
| 서브 텍스트 | Gray | `#94A3B8` |

### 1.2 타이포그래피

| 요소 | 폰트 | 크기 | 굵기 |
|---|---|---|---|
| 메인 제목 | Pretendard | 56px | 700 |
| 서브 제목 | Pretendard | 32px | 600 |
| 카테고리 Badge | Pretendard | 24px | 600 |
| 날짜 / 출처 | Pretendard | 20px | 400 |
| 로고 | Pretendard | 22px | 700 |

### 1.3 시간대별 테마

각 발행 시간대마다 썸네일 배경 테마를 다르게 적용한다.

| 시간대 | 배경 | 강조색 | 아이콘 | 라벨 |
|---|---|---|---|---|
| 아침 08:00 (morning) | Navy `#0F172A` + 좌측 그라디언트 | Blue `#3B82F6` | 🌅 (sunrise) | `PRE-MARKET` |
| 점심 14:00 (afternoon) | Dark Gray `#1E293B` + 우측 그라디언트 | Green/Red (시황 기반) | 📊 (chart) | `심층분석` |
| 저녁 22:00 (evening) | Navy `#0F172A` + 상단 그라디언트 | Yellow `#FBBF24` | 🌙 (moon) | `마감 리캡` |

---

## 2. 썸네일 레이아웃 구조

```
┌─────────────────────────────────────────────────────────────┐ 1200px
│ ┌──────────┐ USStockStory │
│ │ [BADGE] │ 카테고리 + 시간대 라벨 🌅 PRE-MARKET │ 630px
│ └──────────┘ │
│ │
│ 메인 제목 (최대 2줄, 56px Bold) │
│ Apple 2분기 실적 호실적, │
│ 아이폰 판매 급증의 이유는? │
│ │
│ 서브텍스트 (excerpt 앞 50자, 32px) │
│ Apple이 예상을 뛰어넘는 성과를 달성했다. │
│ │
│ ───────────────────────────────────────── │
│ 🏷️ #Apple #기술주 #실적분석 2026.04.13 │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 레이아웃 상세 규격

전체: 1200 × 630px
배경: 단색 + 우측 하단 그라디언트 오버레이

**[로고 영역] 우상단**
- 위치: top: 40px, right: 48px
- 내용: "USStockStory" (Pretendard 22px Bold, White)
- 시간대 아이콘: 로고 좌측 8px 간격

**[카테고리 Badge] 좌상단**
- 위치: top: 40px, left: 48px
- 배경: Primary Blue #3B82F6 (morning) | Green/Red (afternoon) | Yellow #FBBF24 (evening)
- 텍스트: 카테고리명 + 시간대 라벨 (Pretendard 24px 600)
- Padding: 10px 20px
- Border-radius: 8px

**[메인 제목]**
- 위치: top: 140px, left: 48px, right: 48px
- 폰트: Pretendard 56px 700 White
- 최대 2줄 (말줄임표 처리)
- 줄간격: 1.3
- 최대 가로: 1104px

**[서브텍스트]**
- 위치: 제목 하단 + 24px margin
- 폰트: Pretendard 32px 400 #94A3B8
- 최대 1줄 (50자 제한)

**[하단 구분선]**
- 위치: bottom: 100px
- 스타일: 1px solid rgba(255,255,255,0.2) (full width)

**[태그 + 날짜]**
- 위치: bottom: 48px, left: 48px
- 태그: #태그명 (Pretendard 20px 400 #94A3B8), 최대 3개
- 날짜: 우측 정렬 (YYYY.MM.DD)

**[배경 그라디언트 오버레이]**
- 우측 하단: radial-gradient(ellipse at 80% 80%, rgba(59,130,246,0.15) 0%, transparent 60%)
- morning 전용 추가: 좌상단 radial-gradient(ellipse at 10% 10%, rgba(59,130,246,0.1) 0%, transparent 50%)

---

## 3. Claude 프롬프트 확장 (JSON 필드 추가)

기존 CLAUDE_PROMPTS-2.md의 JSON 출력에 썸네일 관련 필드를 추가한다.

### 3.1 추가 필드 정의

```json
{
  "title": "포스트 제목 (기존)",
  "slug": "포스트-슬러그 (기존)",
  "excerpt": "포스트 요약 (기존)",
  "content_md": "마크다운 본문 (기존)",
  "tags": ["태그1", "태그2", "태그3"],
  "category_slug": "종목분석",

  "thumbnail": {
    "headline": "썸네일 메인 제목 (최대 22자, 2줄 기준 44자)",
    "subtext": "썸네일 서브텍스트 (최대 30자)",
    "sentiment": "bullish | bearish | neutral",
    "accent_color": "#10B981 | #EF4444 | #3B82F6 | #FBBF24",
    "highlight_keywords": ["키워드1", "키워드2"]
  }
}
```

### 3.2 필드 상세 명세

| 필드 | 타입 | 길이 | 설명 |
|---|---|---|---|
| `thumbnail.headline` | String | 최대 44자 (2줄) | 썸네일용 짧은 제목. `title`과 달리 임팩트 있게 축약 |
| `thumbnail.subtext` | String | 최대 30자 | `excerpt` 앞부분을 요약한 1줄 문장 |
| `thumbnail.sentiment` | Enum | - | `bullish`(상승 긍정), `bearish`(하락 부정), `neutral` |
| `thumbnail.accent_color` | String | Hex | sentiment 기반 강조색. bullish=`#10B981`, bearish=`#EF4444`, neutral=`#3B82F6` |
| `thumbnail.highlight_keywords` | Array[String] | 1~2개 | 썸네일에 강조 표시할 핵심 키워드 (예: "Apple", "+25%") |

### 3.3 User Prompt 추가 지시 (기존 지시에 병기)

**썸네일 작성 규칙**
- thumbnail.headline은 모바일에서도 읽힐 수 있게 임팩트 있게 작성
- 숫자를 활용하면 클릭률이 높아짐 (예: "3% 상승", "+25%")
- sentiment는 뉴스의 전체적 방향성으로 결정
  - bullish: 상승, 호실적, 긍정적 신호
  - bearish: 하락, 어닝쇼크, 부정적 신호
  - neutral: 중립적 경제지표, 혼조세
- accent_color는 sentiment에 자동 매핑:
  - bullish → #10B981 (Stock Green)
  - bearish → #EF4444 (Stock Red)
  - neutral → #3B82F6 (Primary Blue)
  - 주의/경고 분석 → #FBBF24 (Warning Yellow)

### 3.4 Claude 출력 예시

```json
{
  "title": "Apple 2분기 실적 호실적, 아이폰 판매 급증의 이유는?",
  "slug": "apple-q2-earnings-iphone-sales-surge",
  "excerpt": "Apple이 2분기 실적 발표에서 예상을 뛰어넘는 성과를 달성했다...",
  "content_md": "## 핵심 요약\n\n...",
  "tags": ["Apple", "실적발표", "기술주"],
  "category_slug": "종목분석",

  "thumbnail": {
    "headline": "Apple 실적 깜짝 호실적\n아이폰 판매 +25% 급증",
    "subtext": "서비스 매출도 함께 역대 최고치",
    "sentiment": "bullish",
    "accent_color": "#10B981",
    "highlight_keywords": ["Apple", "+25%"]
  }
}
```

---

## 4. 썸네일 생성 API

### 4.1 생성 방식 선택

| 방식 | 장점 | 단점 | 추천 |
|---|---|---|---|
| **Bannerbear API** | 템플릿 기반, 빠른 설정, n8n 노드 존재 | 유료 ($49/월~) | ⭐⭐⭐⭐⭐ |
| **Cloudinary** | 이미지 변환 + CDN 통합, URL 기반 생성 | 복잡한 설정 | ⭐⭐⭐⭐ |
| **Node.js Canvas (Sharp)** | 무료, 완전 커스터마이즈 | NestJS 서버 부하 | ⭐⭐⭐ |
| **html2canvas + Puppeteer** | HTML/CSS 그대로 사용 | 매우 느림 (3~5초) | ⭐⭐ |

**결론: Bannerbear API 사용 (n8n 공식 노드 지원)**

### 4.2 Bannerbear 템플릿 구성

템플릿 3개 생성 (시간대별):
- stock-blog-morning (morning 테마, Blue accent)
- stock-blog-afternoon (afternoon 테마, Green/Red dynamic)
- stock-blog-evening (evening 테마, Yellow accent)

각 템플릿 레이어:
- background_color → 배경색 (동적)
- badge_text → 카테고리 Badge 텍스트
- badge_color → Badge 배경색 (accent_color 기반)
- headline → thumbnail.headline
- subtext → thumbnail.subtext
- tag_list → tags, tags, tags
- date_text → 발행 날짜 (YYYY.MM.DD)
- gradient_overlay → 고정 레이어
- logo_text → "USStockStory" (고정)

### 4.3 Bannerbear API 호출

```javascript
// n8n Execute Code Node
const bannerbearPayload = {
  template: `stock-blog-${input.post_type}`,  // morning | afternoon | evening
  modifications: [
    {
      name: "badge_text",
      text: getBadgeText(input.post_type, input.category_slug)
      // morning → "🌅 PRE-MARKET"
      // afternoon → "📊 심층분석"
      // evening → "🌙 마감 리캡"
    },
    {
      name: "badge_color",
      color: input.thumbnail.accent_color.replace("#", "")
    },
    {
      name: "headline",
      text: input.thumbnail.headline
    },
    {
      name: "subtext",
      text: input.thumbnail.subtext
    },
    {
      name: "tag_list",
      text: input.tags.slice(0, 3).map(t => `#${t}`).join("  ")
    },
    {
      name: "date_text",
      text: new Date().toLocaleDateString("ko-KR", {
        year: "numeric", month: "2-digit", day: "2-digit"
      }).replace(/\./g, ".").trim()
    }
  ],
  webhook_url: `${process.env.NESTJS_API_BASE_URL}/api/internal/thumbnail-webhook`
};

return { payload: bannerbearPayload };
```

### 4.4 Bannerbear 응답 처리

```javascript
// Bannerbear 응답 (동기 방식 선택 시)
{
  "uid": "tb_xxxxxxxxxxxx",
  "status": "completed",
  "image_url": "https://cdn.bannerbear.com/images/xxx.png",
  "image_url_png": "https://cdn.bannerbear.com/images/xxx.png",
  "width": 1200,
  "height": 630
}

// n8n에서 image_url 추출 후 CDN 업로드 또는 직접 사용
const coverImageUrl = response.image_url_png;
```

---

## 5. n8n 워크플로우 통합

### 5.1 기존 워크플로우 수정 위치

기존 `N8N_WORKFLOW-5.md`의 노드 순서에 썸네일 노드 **삽입**:

**[기존]**
Node 13 (JSON Validation) → Node 14 (NestJS Publish API)

**[변경]**
Node 13 (JSON Validation) → Node 13-T1 (썸네일 페이로드 생성)
→ Node 13-T2 (Bannerbear API 호출)
→ Node 13-T3 (이미지 URL 추출)
→ Node 14 (NestJS Publish API, cover_image_url 포함)

### 5.2 추가 노드 상세

**Node 13-T1: 썸네일 페이로드 생성**
- Type: Execute Code (JavaScript)
- Input: validated post data (thumbnail 필드 포함)
- Output: bannerbear_payload 객체

**Node 13-T2: Bannerbear API 호출**
- Type: HTTP Request
- Method: POST
- URL: https://api.bannerbear.com/v2/images
- Headers:
  - Authorization: Bearer {{$env.BANNERBEAR_API_KEY}}
  - Content-Type: application/json
- Body: {{$json.bannerbear_payload}}
- Timeout: 30초 (이미지 생성 대기)

**Node 13-T3: 이미지 URL 추출**
```javascript
// Type: Execute Code
const imageUrl = input.image_url_png
  || `https://cdn.usstockstory.com/thumbnails/default-${input.post_type}.png`;
// Bannerbear 실패 시 fallback 기본 이미지 사용

return {
  cover_image_url: imageUrl,
  thumbnail_generated: !!input.image_url_png
};
```

### 5.3 Node 14 (NestJS Publish API) 수정

기존 요청 Body에 `cover_image_url` 추가:

```javascript
// 기존 + 추가
{
  title: json.post.title,
  slug: json.post.slug,
  excerpt: json.post.excerpt,
  content_md: json.post.content_md,
  category_slug: json.post.category_slug,
  tags: JSON.stringify(json.post.tags),
  is_ai_generated: true,
  n8n_execution_id: execution.id,
  crawled_urls: JSON.stringify(input.all0.news.map(n => n.url)),
  claude_model: "claude-3-5-sonnet-20241022",
  claude_prompt_tokens: 450,
  claude_completion_tokens: 320,
  cover_image_url: json.cover_image_url   // ← 추가
}
```

---

## 6. NestJS API 수정

### 6.1 publish-post.dto.ts 수정

```typescript
// src/internal/dto/publish-post.dto.ts
export class PublishPostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  // ... 기존 필드 ...

  @IsString()
  @IsOptional()
  @IsUrl()
  cover_image_url?: string;  // ← 추가 (선택적)
}
```

### 6.2 posts.service.ts 처리 로직

```typescript
// cover_image_url이 없을 경우 기본 OG 이미지 사용
const coverImageUrl = dto.cover_image_url
  || `https://cdn.usstockstory.com/thumbnails/default-${postType}.png`;
```

### 6.3 기본(Fallback) 썸네일

Bannerbear API 장애 또는 타임아웃 시 사용할 기본 이미지 3종을 미리 CDN에 업로드:
- /public/images/thumbnails/
  - default-morning.png (1200×630, PRE-MARKET 텍스트 포함)
  - default-afternoon.png (1200×630, 심층분석 텍스트 포함)
  - default-evening.png (1200×630, 마감 리캡 텍스트 포함)

---

## 7. AI 로그 확장

### 7.1 ai_post_logs 테이블 컬럼 추가

```sql
ALTER TABLE ai_post_logs
  ADD COLUMN thumbnail_generated BOOLEAN DEFAULT FALSE,
  ADD COLUMN thumbnail_url VARCHAR(500) NULL,
  ADD COLUMN bannerbear_uid VARCHAR(100) NULL,
  ADD COLUMN thumbnail_sentiment ENUM('bullish','bearish','neutral') NULL;
```

### 7.2 ai-logs.service.ts 업데이트

```typescript
// CreateAiLogDto 추가 필드
thumbnail_generated?: boolean;
thumbnail_url?: string;
bannerbear_uid?: string;
thumbnail_sentiment?: 'bullish' | 'bearish' | 'neutral';
```

---

## 8. 검증 및 에러 핸들링

### 8.1 썸네일 생성 검증 (n8n)

```javascript
const validateThumbnailField = (thumbnail) => {
  const errors = [];

  if (!thumbnail) {
    errors.push("thumbnail field missing");
    return { valid: false, errors };
  }

  if (!thumbnail.headline || thumbnail.headline.length > 44) {
    errors.push("headline: max 44 chars");
  }
  if (!thumbnail.subtext || thumbnail.subtext.length > 30) {
    errors.push("subtext: max 30 chars");
  }
  const validSentiments = ["bullish", "bearish", "neutral"];
  if (!validSentiments.includes(thumbnail.sentiment)) {
    errors.push("invalid sentiment");
  }

  return errors.length === 0
    ? { valid: true }
    : { valid: false, errors };
};
```

### 8.2 에러 처리 흐름

Bannerbear API 실패
→ 최대 2회 재시도 (3초 간격)
→ 재시도 실패 시 → fallback 기본 이미지 사용
→ Discord 알림: "썸네일 생성 실패 - 기본 이미지 사용"
→ ai_post_logs: thumbnail_generated = false 기록
→ 포스트 발행은 정상 진행 (썸네일 실패로 발행 중단 금지)

---

## 9. 비용 추정

### 9.1 Bannerbear 플랜별 비용

| 플랜 | 월 이미지 수 | 가격 | 비고 |
|---|---|---|---|
| Starter | 100장 | $49/월 | 하루 3장 × 30일 = 90장 → 충분 |
| Pro | 500장 | $99/월 | 여유 있는 운영 |

**결론: Starter 플랜 ($49/월) 으로 충분**

### 9.2 월간 총 비용 (Claude 포함)

| 항목 | 비용 |
|---|---|
| Claude API | ~$1.13/월 |
| Bannerbear API | $49/월 |
| **합계** | **~$50.13/월** |

---

## 10. 환경 변수 추가

```bash
# n8n .env 추가
BANNERBEAR_API_KEY=your-bannerbear-api-key
BANNERBEAR_TEMPLATE_MORNING=tb_template_morning_uid
BANNERBEAR_TEMPLATE_AFTERNOON=tb_template_afternoon_uid
BANNERBEAR_TEMPLATE_EVENING=tb_template_evening_uid
THUMBNAIL_FALLBACK_BASE_URL=https://cdn.usstockstory.com/thumbnails
```

---

## 11. 배포 전 체크리스트

- [ ] Bannerbear 계정 생성 및 API 키 발급
- [ ] 시간대별 템플릿 3개 생성 (morning / afternoon / evening)
- [ ] 각 템플릿 레이어 명 일치 확인 (badge_text, headline 등)
- [ ] fallback 기본 이미지 3종 CDN 업로드
- [ ] n8n 환경 변수 `BANNERBEAR_API_KEY` 등록
- [ ] Claude 프롬프트에 `thumbnail` 필드 지시 추가
- [ ] JSON 검증 로직에 `thumbnail` 필드 검증 추가
- [ ] NestJS `publish-post.dto.ts` 수정 및 재배포
- [ ] `ai_post_logs` 테이블 마이그레이션 실행
- [ ] 썸네일 생성 테스트 3회 (시간대별 1회씩)
- [ ] 어드민 AI 로그 화면에서 thumbnail_url 표시 확인
