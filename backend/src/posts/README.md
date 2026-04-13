# Posts 모듈

포스트(블로그 글) 관리 모듈입니다. 공개 API와 관리자 API, 그리고 n8n 자동화용 내부 API를 제공합니다.

## 주요 기능

- ✅ 포스트 CRUD (생성, 조회, 수정, 삭제)
- ✅ 카테고리 + 태그 관리 (다대다 관계)
- ✅ 소프트 삭제 (deleted_at)
- ✅ AI 자동 발행 (n8n 연동)
- ✅ 페이지네이션 + 검색 (MySQL 기반)
- ✅ 발행 상태 관리 (발행/비공개)

## 파일 구조

```
posts/
├── entities/
│   ├── post.entity.ts         # Post 엔티티 (메인)
│   ├── category.entity.ts     # Category 엔티티
│   └── tag.entity.ts          # Tag 엔티티
├── dto/
│   ├── create-post.dto.ts     # 포스트 생성
│   ├── update-post.dto.ts     # 포스트 수정
│   └── query-posts.dto.ts     # 포스트 조회 쿼리
├── posts.service.ts           # 포스트 비즈니스 로직
├── posts.controller.ts        # API 엔드포인트
├── posts.module.ts            # Posts 모듈
└── README.md                  # 이 파일
```

## 데이터베이스 스키마

### Posts 테이블
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | UUID | 기본 키 |
| title | VARCHAR(255) | 포스트 제목 |
| slug | VARCHAR(255) | URL 슬러그 (유니크) |
| excerpt | TEXT | 포스트 요약 |
| content_md | LONGTEXT | 마크다운 원본 |
| content_html | LONGTEXT | 렌더링된 HTML |
| reading_time_mins | INT | 읽는 시간 (분) |
| cover_image_url | VARCHAR(255) | 썸네일 이미지 URL |
| is_published | BOOLEAN | 공개 여부 |
| is_ai_generated | BOOLEAN | AI 생성 여부 |
| ai_source_urls | JSON | 뉴스 크롤링 출처 |
| category_id | UUID | 카테고리 (외래키) |
| author_id | UUID | 작성자 (NULL=AI) |
| published_at | TIMESTAMP | 발행 시간 |
| created_at | TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | 수정 시간 |
| deleted_at | TIMESTAMP | 삭제 시간 (소프트 삭제) |

### Categories 테이블
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | UUID | 기본 키 |
| slug | VARCHAR(100) | 카테고리 슬러그 (유니크, 5개 고정) |
| name_ko | VARCHAR(100) | 한국어 카테고리명 |
| description | VARCHAR(255) | 카테고리 설명 |
| created_at | TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | 수정 시간 |

**5개 고정 카테고리:**
- `종목분석` — 개별 종목 심층 분석
- `시장동향` — 시장 전체 흐름, 경제 지표
- `실적발표` — 실적 발표 분석
- `etf-분석` — ETF, 섹터 분석
- `투자전략` — 투자 전략, 팁

### Tags 테이블
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | UUID | 기본 키 |
| name | VARCHAR(100) | 태그명 (유니크) |
| slug | VARCHAR(100) | 태그 슬러그 (유니크) |
| created_at | TIMESTAMP | 생성 시간 |

**예시:** Apple, Tesla, NASDAQ, S&P500, 기술주, 성장주 등

### Post_Tags 테이블 (다대다)
| 컬럼 | 타입 |
|---|---|
| post_id | UUID (FK) |
| tag_id | UUID (FK) |

---

## API 엔드포인트

### 공개 API (JWT 불필요)

#### GET /api/posts/published
공개된 포스트 목록 조회 (페이지네이션)

**Query Parameters:**
```
page: number (기본: 1)
limit: number (기본: 10, 최대: 100)
category_id: string (선택)
tag_id: string (선택)
search: string (선택, 제목/요약 검색)
sort: 'latest' | 'oldest' (기본: 'latest')
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Apple 2분기 실적 호실적",
      "slug": "apple-q2-earnings",
      "excerpt": "Apple이 예상을 뛰어넘는 성과를 달성했다...",
      "reading_time_mins": 5,
      "cover_image_url": "https://cdn.usstockstory.com/thumbnails/...",
      "is_ai_generated": true,
      "category": {
        "id": "uuid",
        "slug": "종목분석",
        "name_ko": "종목분석"
      },
      "tags": [
        { "id": "uuid", "name": "Apple", "slug": "apple" }
      ],
      "published_at": "2026-04-13T08:00:00Z",
      "author": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

#### GET /api/posts/published/:slug
공개된 포스트 상세 조회

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Apple 2분기 실적 호실적",
  "slug": "apple-q2-earnings",
  "excerpt": "...",
  "content_html": "<h2>핵심 요약</h2><p>...</p>",
  "reading_time_mins": 5,
  "cover_image_url": "https://...",
  "is_ai_generated": true,
  "ai_source_urls": [
    "https://reuters.com/...",
    "https://marketwatch.com/..."
  ],
  "category": { ... },
  "tags": [ ... ],
  "author": null,
  "published_at": "2026-04-13T08:00:00Z"
}
```

---

### 관리자 API (JWT 필수)

#### GET /api/posts
모든 포스트 조회 (발행/비공개 모두)

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:** (findPublished과 동일)

#### GET /api/posts/:id
포스트 ID로 조회

#### POST /api/posts
새 포스트 생성

**Request Body:**
```json
{
  "title": "포스트 제목",
  "slug": "post-slug",
  "excerpt": "포스트 요약 (최소 10자)",
  "content_md": "# 마크다운\n\n본문...",
  "content_html": "<h1>마크다운</h1><p>본문...</p>",
  "reading_time_mins": 5,
  "cover_image_url": "https://...",
  "category_id": "uuid",
  "tag_ids": ["uuid1", "uuid2"],
  "ai_source_urls": ["https://..."],
  "is_ai_generated": false,
  "is_published": true
}
```

**Response (201):** 생성된 포스트 객체

#### PUT /api/posts/:id
포스트 수정

**Request Body:** (모든 필드 선택적)
```json
{
  "title": "수정된 제목",
  "is_published": false
}
```

#### DELETE /api/posts/:id
포스트 삭제 (소프트 삭제, 복구 가능)

**Response (204):** 빈 응답

---

### 내부 API (n8n용)

#### POST /api/posts/internal/publish
n8n 자동화 포스트 발행

**Request Body:**
```json
{
  "title": "Apple 실적 호실적",
  "slug": "apple-q2-earnings",
  "excerpt": "Apple이 예상을 뛰어넘는 성과...",
  "content_md": "## 핵심\n\n...",
  "content_html": "<h2>핵심</h2><p>...</p>",
  "category_id": "uuid",
  "tags": ["Apple", "실적발표"],
  "ai_source_urls": ["https://..."],
  "reading_time_mins": 5,
  "cover_image_url": "https://cdn.usstockstory.com/thumbnails/..."
}
```

**Response (201):** 발행된 포스트 객체

---

## 사용 예시

### Frontend (Next.js)에서 포스트 조회

```typescript
// 공개 포스트 목록
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/posts/published?page=1&limit=10&sort=latest`
);
const { data, pagination } = await response.json();

// 포스트 상세
const post = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/posts/published/${slug}`
).then(r => r.json());
```

### Admin (Next.js)에서 포스트 관리

```typescript
// 포스트 생성 (관리자)
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/posts`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: '새 포스트',
      slug: 'new-post',
      excerpt: '요약',
      content_md: '# 제목\n\n본문',
      content_html: '<h1>제목</h1><p>본문</p>',
      category_id: categoryId,
      tag_ids: [tagId1, tagId2],
      is_published: true
    })
  }
);
```

### n8n에서 자동 발행

```javascript
// Node 14: NestJS Publish API
{
  method: 'POST',
  url: `${NESTJS_API_URL}/api/posts/internal/publish`,
  headers: {
    'X-N8N-Secret': n8n_secret,
    'Content-Type': 'application/json'
  },
  body: {
    title: json.post.title,
    slug: json.post.slug,
    excerpt: json.post.excerpt,
    content_md: json.post.content_md,
    content_html: json.post.content_html,
    category_id: json.post.category_id,
    tags: json.post.tags,
    ai_source_urls: json.crawled_urls,
    cover_image_url: json.cover_image_url,
    reading_time_mins: json.post.reading_time_mins
  }
}
```

---

## 특수 로직

### Soft Delete (소프트 삭제)
- `DELETE /api/posts/:id` 호출 시 `deleted_at`에 현재 시간 저장
- 포스트는 DB에 남아있지만 공개 조회에서는 제외됨
- 관리자 API에서는 보이지만 `deleted_at IS NOT NULL` 필터 적용 가능

### AI 자동 발행 (`is_ai_generated = true`)
- n8n에서만 사용 (관리자 직접 생성 가능하나 권장 안함)
- `author_id = null`로 저장 (AI가 작성)
- 발행 시 자동으로 `published_at` 설정

### 태그 자동 생성 (`createFromAI`)
- AI 발행 시 전달된 태그명으로 기존 태그 검색
- 없으면 자동 생성 (slug 기반)

### 읽는 시간 계산
- n8n에서 계산해서 전달 (한국어 300자/분 기준)
- 또는 NestJS에서 markdown 단어 수로 자동 계산 가능

---

## 마이그레이션

```bash
# 마이그레이션 생성
npm run migration:generate

# 마이그레이션 실행
npm run migration:run

# 마이그레이션 되돌리기
npm run migration:revert
```

---

## 카테고리 초기화 (Seeding)

```typescript
// src/seeding/seed-categories.ts 생성 후 실행
import { v4 as uuidv4 } from 'uuid';

const categories = [
  { slug: '종목분석', name_ko: '종목분석', description: '개별 종목 심층 분석' },
  { slug: '시장동향', name_ko: '시장동향', description: '시장 전체 흐름, 경제 지표' },
  { slug: '실적발표', name_ko: '실적발표', description: '실적 발표 분석' },
  { slug: 'etf-분석', name_ko: 'ETF분석', description: 'ETF, 섹터 분석' },
  { slug: '투자전략', name_ko: '투자전략', description: '투자 전략, 팁' }
];

for (const cat of categories) {
  await categoryRepository.insert({
    id: uuidv4(),
    ...cat,
    created_at: new Date(),
    updated_at: new Date()
  });
}
```

---

## 에러 코드

| Status | Message | 원인 |
|---|---|---|
| 400 | 이미 존재하는 슬러그입니다 | slug 중복 |
| 400 | 존재하지 않는 카테고리입니다 | 잘못된 category_id |
| 400 | 존재하지 않는 태그가 있습니다 | 잘못된 tag_id |
| 404 | 포스트를 찾을 수 없습니다 | 포스트 ID/slug 없음 |
| 401 | 인증이 필요합니다 | JWT 토큰 없음 |

---

## 성능 최적화

- **인덱스**: `slug`, `published_at`, `category_id`, `is_ai_generated`
- **페이지네이션**: 기본 limit 10 (최대 100)
- **캐싱**: Next.js ISR 재검증 트리거 (관리자 API 호출 시)
- **검색**: MySQL ngram 풀텍스트 인덱스 (향후 구현)

---

## 향후 개선

- [ ] 조회수 기반 정렬 (popular sort)
- [ ] 관련 포스트 추천
- [ ] 댓글 시스템 (Giscus → 자체 구현)
- [ ] 포스트 예약 발행
- [ ] 이메일 뉴스레터 발송
