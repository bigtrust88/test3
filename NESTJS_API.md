# NestJS REST API 명세서

## 개요

NestJS 백엔드가 제공하는 모든 REST API 엔드포인트 정의.
- **Base URL**: `https://api.usstockstory.com`
- **인증**: JWT Bearer Token (관리자 API만)
- **내부 API**: n8n만 접근 가능 (Shared Secret)

---

## 1. 인증 API

### 1.1 관리자 로그인

```
POST /api/auth/login

Request:
{
  "email": "admin@example.com",
  "password": "securePassword123"
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin",
    "role": "admin"
  }
}

Response (401):
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

### 1.2 토큰 갱신

```
POST /api/auth/refresh

Header:
Authorization: Bearer {refresh_token}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.3 로그아웃

```
POST /api/auth/logout

Header:
Authorization: Bearer {access_token}

Response (200):
{
  "message": "Logout successful"
}
```

---

## 2. 공개 API (인증 불필요)

### 2.1 포스트 목록 조회

```
GET /api/posts?page=1&limit=10&category=종목분석&sort=latest

Query Parameters:
- page: 페이지 번호 (기본값: 1)
- limit: 페이지당 포스트 개수 (기본값: 10, 최대: 50)
- category: 카테고리 필터 (선택사항)
- sort: 정렬 순서 (latest|popular|trending, 기본값: latest)
- tag: 태그 필터 (선택사항, 다중 가능 ?tag=Apple&tag=TSLA)

Response (200):
{
  "data": [
    {
      "id": "uuid-123",
      "title": "Apple 분기실적 분석",
      "slug": "apple-분기실적-분석",
      "excerpt": "Apple이 2분기 실적에서 예상을 뛰어넘었다...",
      "cover_image_url": "https://cdn.example.com/image.jpg",
      "reading_time_mins": 5,
      "category": {
        "id": 1,
        "slug": "종목분석",
        "name_ko": "종목분석"
      },
      "tags": ["Apple", "실적", "기술주"],
      "author": {
        "id": null,
        "name": "AI"
      },
      "is_ai_generated": true,
      "published_at": "2025-04-13T08:00:00Z",
      "created_at": "2025-04-13T07:55:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 127,
    "pages": 13,
    "has_next": true,
    "has_prev": false
  }
}
```

### 2.2 포스트 상세 조회

```
GET /api/posts/{slug}

Response (200):
{
  "id": "uuid-123",
  "title": "Apple 분기실적 분석",
  "slug": "apple-분기실적-분석",
  "excerpt": "...",
  "content_html": "<h2>핵심 요약</h2><p>...</p>",
  "content_md": "## 핵심 요약\n\n...",
  "cover_image_url": "...",
  "reading_time_mins": 5,
  "category": {...},
  "tags": [...],
  "author": {...},
  "is_ai_generated": true,
  "ai_source_urls": ["https://reuters.com/...", "https://cnbc.com/..."],
  "published_at": "2025-04-13T08:00:00Z",
  "created_at": "2025-04-13T07:55:00Z",
  "views_count": 1234,
  "related_posts": [
    {
      "id": "uuid-456",
      "title": "기술주 강세 분석",
      "slug": "기술주-강세-분석"
    }
  ]
}

Response (404):
{
  "statusCode": 404,
  "message": "Post not found"
}
```

### 2.3 카테고리 목록

```
GET /api/categories

Response (200):
{
  "data": [
    {
      "id": 1,
      "slug": "종목분석",
      "name_ko": "종목분석",
      "description": "개별 주식의 기본분석과 기술적 분석",
      "post_count": 45
    },
    {
      "id": 2,
      "slug": "시장동향",
      "name_ko": "시장동향",
      "description": "미국 주식시장 전체 동향",
      "post_count": 38
    }
  ]
}
```

### 2.4 태그 목록 (클라우드 용)

```
GET /api/tags?limit=50

Response (200):
{
  "data": [
    {
      "slug": "Apple",
      "name": "Apple",
      "post_count": 12
    },
    {
      "slug": "TSLA",
      "name": "TSLA",
      "post_count": 8
    }
  ]
}
```

### 2.5 검색

```
GET /api/search?q=Apple&category=종목분석&limit=20

Query Parameters:
- q: 검색어 (필수)
- category: 카테고리 필터 (선택사항)
- limit: 결과 개수 (기본값: 20)

Response (200):
{
  "data": [
    {
      "id": "uuid-123",
      "title": "Apple 분기실적 분석",
      "slug": "apple-분기실적-분석",
      "excerpt": "Apple이...",
      "highlight": "<strong>Apple</strong>이 2분기 실적에서..."
    }
  ],
  "total": 12
}
```

### 2.6 사이트맵 동적 생성

```
GET /sitemap.xml

Response (200):
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://usstockstory.com/</loc>
    <lastmod>2025-04-13</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://usstockstory.com/post/apple-분기실적-분석</loc>
    <lastmod>2025-04-13</lastmod>
    <changefreq>never</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 3. 관리자 API (JWT 인증 필수)

### 3.1 포스트 생성

```
POST /api/admin/posts

Header:
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "title": "새로운 포스트 제목",
  "slug": "새로운-포스트-제목",
  "excerpt": "포스트 요약...",
  "content_md": "## 제목\n\n본문...",
  "category_id": 1,
  "tags": ["Apple", "실적"],
  "cover_image_url": "https://cdn.example.com/image.jpg",
  "is_published": true
}

Response (201):
{
  "id": "uuid-456",
  "title": "새로운 포스트 제목",
  "slug": "새로운-포스트-제목",
  "excerpt": "포스트 요약...",
  "content_html": "<h2>제목</h2><p>본문...</p>",
  "reading_time_mins": 5,
  "category_id": 1,
  "tags": ["Apple", "실적"],
  "is_published": true,
  "published_at": "2025-04-13T14:30:00Z",
  "created_at": "2025-04-13T14:30:00Z"
}

Response (400):
{
  "statusCode": 400,
  "message": "Invalid input",
  "errors": {
    "title": "Title must be 40-60 characters"
  }
}
```

### 3.2 포스트 수정

```
PUT /api/admin/posts/{id}

Header:
Authorization: Bearer {access_token}

Request:
{
  "title": "수정된 제목",
  "content_md": "수정된 내용...",
  "is_published": true
}

Response (200):
{
  "id": "uuid-456",
  "title": "수정된 제목",
  ...
  "updated_at": "2025-04-13T15:00:00Z"
}
```

### 3.3 포스트 삭제

```
DELETE /api/admin/posts/{id}

Header:
Authorization: Bearer {access_token}

Response (204):
(No Content)

Response (404):
{
  "statusCode": 404,
  "message": "Post not found"
}
```

### 3.4 포스트 발행 상태 변경

```
PATCH /api/admin/posts/{id}/publish

Header:
Authorization: Bearer {access_token}

Request:
{
  "is_published": true
}

Response (200):
{
  "id": "uuid-456",
  "title": "...",
  "is_published": true,
  "published_at": "2025-04-13T15:30:00Z"
}
```

### 3.5 대시보드 데이터

```
GET /api/admin/dashboard

Header:
Authorization: Bearer {access_token}

Response (200):
{
  "today": {
    "posts_published": 2,
    "posts_target": 3,
    "views": 1234,
    "sessions": 456
  },
  "this_week": {
    "total_posts": 15,
    "total_views": 8900,
    "total_sessions": 2345
  },
  "ai_stats": {
    "success_rate": 0.92,
    "success_count": 23,
    "failed_count": 2,
    "total_tokens_used": 45000
  },
  "top_posts": [
    {
      "id": "uuid-123",
      "title": "Apple 실적 분석",
      "views": 2345
    }
  ]
}
```

### 3.6 AI 자동화 로그

```
GET /api/admin/ai-logs?page=1&limit=20&status=success&days=7

Query Parameters:
- page: 페이지 번호
- limit: 페이지당 로그 개수
- status: 필터 (pending|success|failed|review_needed)
- days: 최근 N일 조회 (기본값: 7)

Response (200):
{
  "data": [
    {
      "id": 1,
      "post_id": "uuid-123",
      "n8n_execution_id": "exec-abc123",
      "status": "success",
      "trigger_time": "2025-04-13T08:00:00Z",
      "crawled_urls": ["https://reuters.com/...", "https://cnbc.com/..."],
      "claude_model": "claude-3-5-sonnet",
      "claude_prompt_tokens": 450,
      "claude_completion_tokens": 320,
      "error_message": null,
      "created_at": "2025-04-13T08:05:00Z",
      "post": {
        "id": "uuid-123",
        "title": "Apple 실적 분석",
        "slug": "apple-실적-분석"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 87,
    "pages": 5
  }
}
```

---

## 4. 내부 API (n8n만 접근, Shared Secret 인증)

### 4.1 포스트 자동 발행 (n8n 호출)

```
POST /api/internal/posts/publish

Header:
X-N8N-Secret: {SHARED_SECRET}
Content-Type: application/json

Request:
{
  "title": "Apple 실적 분석",
  "slug": "apple-실적-분석",
  "excerpt": "Apple이 2분기 실적...",
  "content_md": "## 핵심 요약\n\n...",
  "category_slug": "종목분석",
  "tags": ["Apple", "실적"],
  "is_ai_generated": true,
  "n8n_execution_id": "exec-abc123",
  "crawled_urls": ["https://reuters.com/...", "https://cnbc.com/..."],
  "claude_model": "claude-3-5-sonnet",
  "claude_prompt_tokens": 450,
  "claude_completion_tokens": 320
}

Response (201):
{
  "id": "uuid-789",
  "title": "Apple 실적 분석",
  "slug": "apple-실적-분석",
  "post_url": "https://usstockstory.com/post/apple-실적-분석",
  "is_published": true,
  "published_at": "2025-04-13T08:05:00Z"
}

Response (400):
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [...]
}
```

### 4.2 최근 크롤링 소스 조회 (중복 검사)

```
GET /api/internal/recent-sources?days=7

Header:
X-N8N-Secret: {SHARED_SECRET}

Response (200):
{
  "sources": [
    {
      "url": "https://reuters.com/article/apple",
      "used_in_post": "uuid-123",
      "crawled_at": "2025-04-13T08:00:00Z"
    },
    {
      "url": "https://cnbc.com/article/fed",
      "used_in_post": "uuid-124",
      "crawled_at": "2025-04-13T14:00:00Z"
    }
  ]
}
```

### 4.3 ISR 재검증 트리거

```
POST /api/internal/revalidate

Header:
X-N8N-Secret: {SHARED_SECRET}

Request:
{
  "paths": ["/", "/post/apple-실적-분석", "/종목분석"]
}

Response (200):
{
  "message": "Revalidation triggered",
  "paths": ["/", "/post/apple-실적-분석", "/종목분석"]
}
```

### 4.4 AI 자동화 로그 저장

```
POST /api/internal/ai-logs

Header:
X-N8N-Secret: {SHARED_SECRET}

Request:
{
  "post_id": "uuid-123",
  "n8n_execution_id": "exec-abc123",
  "status": "success",
  "crawled_urls": ["https://reuters.com/..."],
  "claude_model": "claude-3-5-sonnet",
  "claude_prompt_tokens": 450,
  "claude_completion_tokens": 320,
  "error_message": null
}

Response (201):
{
  "id": 1,
  "post_id": "uuid-123",
  "n8n_execution_id": "exec-abc123",
  "status": "success",
  "created_at": "2025-04-13T08:05:00Z"
}
```

---

## 5. 에러 응답 형식

모든 에러는 다음 형식으로 응답:

```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "timestamp": "2025-04-13T08:00:00Z",
  "path": "/api/posts",
  "errors": {
    "field_name": "Error detail"
  }
}
```

### 상태 코드

| 코드 | 의미 |
|---|---|
| 200 | OK (성공) |
| 201 | Created (생성 성공) |
| 204 | No Content (삭제 성공) |
| 400 | Bad Request (잘못된 요청) |
| 401 | Unauthorized (인증 필요) |
| 403 | Forbidden (권한 없음) |
| 404 | Not Found (찾을 수 없음) |
| 429 | Too Many Requests (Rate limit 초과) |
| 500 | Internal Server Error |

---

## 6. Rate Limiting

```
일반 API: 분당 60 요청 (x-ratelimit-limit: 60)
내부 API: 분당 1000 요청 (무시할 수준)
검색 API: 분당 30 요청
```

---

## 7. 응답 헤더

```
Content-Type: application/json
X-Request-Id: uuid-request-id (요청 추적용)
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1681234560
Cache-Control: public, max-age=3600
ETag: "abc123def456"
```

---

## 8. 페이지네이션 전략

Cursor 기반 페이지네이션 사용:

```
GET /api/posts?cursor=abc123&limit=10

Response:
{
  "data": [...],
  "pagination": {
    "cursor": "abc123",
    "next_cursor": "def456",
    "limit": 10,
    "has_next": true
  }
}
```

---

## 9. 캐싱 전략

| 엔드포인트 | TTL | 캐시 전략 |
|---|---|---|
| GET /posts | 1분 | Redis + CDN |
| GET /posts/{slug} | 24시간 | Redis (수정 시 무효화) |
| GET /categories | 24시간 | Redis |
| GET /tags | 1시간 | Redis |
| GET /search | 없음 | 실시간 조회 |
| GET /admin/* | 없음 | 캐시 안 함 |

---

## 10. 배포 환경 변수

```
NEXT_PUBLIC_API_URL=https://api.usstockstory.com
DATABASE_URL=mysql://user:pass@localhost:3306/blog
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
N8N_SHARED_SECRET=shared-secret-key
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-...
```
