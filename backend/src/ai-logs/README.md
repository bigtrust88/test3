# AI Logs 모듈

n8n 자동화 워크플로우의 실행 로그를 관리하는 모듈입니다. 포스트 생성 성공/실패, 썸네일 생성 여부, 토큰 사용량 등을 기록합니다.

## 주요 기능

- ✅ n8n 실행 로그 기록 (pendingu → success/failed)
- ✅ Claude API 토큰 사용량 추적
- ✅ 썸네일 생성 여부 및 URL 저장
- ✅ 에러 메시지 로깅
- ✅ 일별/주별/월별 통계
- ✅ 비용 계산 (Claude + Bannerbear)

## 파일 구조

```
ai-logs/
├── entities/
│   └── ai-log.entity.ts       # AI Log 엔티티
├── dto/
│   ├── create-ai-log.dto.ts   # 로그 생성
│   └── update-ai-log.dto.ts   # 로그 업데이트
├── ai-logs.service.ts         # 비즈니스 로직
├── ai-logs.controller.ts      # API 엔드포인트
├── ai-logs.module.ts          # AI Logs 모듈
└── README.md                  # 이 파일
```

## 데이터베이스 스키마

### ai_post_logs 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | UUID | 기본 키 |
| post_id | UUID | 생성된 포스트 ID (NULL = 실패) |
| n8n_execution_id | VARCHAR(100) | n8n 실행 ID (유니크) |
| trigger_time | TIMESTAMP | 실행 시간 |
| trigger_type | ENUM | 실행 유형 (morning/afternoon/evening) |
| crawled_urls | JSON | 크롤링한 뉴스 URL 배열 |
| claude_prompt_tokens | INT | Claude 입력 토큰 |
| claude_completion_tokens | INT | Claude 출력 토큰 |
| claude_model | VARCHAR(50) | Claude 모델명 |
| status | ENUM | 상태 (pending/success/failed) |
| is_success | BOOLEAN | 성공 여부 |
| error_message | TEXT | 에러 메시지 |
| thumbnail_generated | BOOLEAN | 썸네일 생성 여부 |
| thumbnail_url | VARCHAR(500) | 생성된 썸네일 URL |
| bannerbear_uid | VARCHAR(100) | Bannerbear 실행 UID |
| thumbnail_sentiment | ENUM | 썸네일 감정 (bullish/bearish/neutral) |
| created_at | TIMESTAMP | 기록 시간 |

---

## API 엔드포인트

### 관리자 API (JWT 필수)

#### GET /api/ai-logs
AI 로그 목록 조회 (페이지네이션)

**Query Parameters:**
```
page: number (기본: 1)
limit: number (기본: 20, 최대: 100)
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "post_id": "uuid",
      "n8n_execution_id": "xxx-execution-id",
      "trigger_time": "2026-04-13T08:00:00Z",
      "trigger_type": "morning",
      "claude_prompt_tokens": 450,
      "claude_completion_tokens": 320,
      "claude_model": "claude-3-5-sonnet-20241022",
      "status": "success",
      "is_success": true,
      "error_message": null,
      "thumbnail_generated": true,
      "thumbnail_url": "https://cdn.usstockstory.com/thumbnails/...",
      "bannerbear_uid": "tb_xxx",
      "thumbnail_sentiment": "bullish",
      "created_at": "2026-04-13T08:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### GET /api/ai-logs/today
오늘 실행 현황

**Response (200):**
```json
{
  "logs": [...],
  "stats": {
    "total": 3,
    "success": 3,
    "failed": 0,
    "thumbnailGenerated": 3,
    "byTriggerType": {
      "morning": 1,
      "afternoon": 1,
      "evening": 1
    },
    "totalTokens": {
      "prompt": 1350,
      "completion": 960
    }
  }
}
```

#### GET /api/ai-logs/weekly
일주일 실행 현황

**Response (200):**
```json
[
  {
    "date": "2026-04-07",
    "total": 3,
    "success": 3,
    "failed": 0,
    "successRate": "100%"
  },
  {
    "date": "2026-04-08",
    "total": 3,
    "success": 2,
    "failed": 1,
    "successRate": "66.7%"
  }
]
```

#### GET /api/ai-logs/monthly/:year/:month
월간 실행 현황 및 비용

**Parameters:**
- `year`: 연도 (예: 2026)
- `month`: 월 (1~12)

**Response (200):**
```json
{
  "year": 2026,
  "month": 4,
  "totalRuns": 63,
  "successfulRuns": 60,
  "failedRuns": 3,
  "successRate": "95.2%",
  "totalTokens": {
    "prompt": 28350,
    "completion": 19200
  },
  "estimatedCost": {
    "claude": "67.34",
    "totalWithBannerbear": "116.34"
  }
}
```

#### GET /api/ai-logs/failures
최근 실패 로그

**Query Parameters:**
```
limit: number (기본: 10)
```

#### GET /api/ai-logs/:id
로그 상세 조회

#### GET /api/ai-logs/execution/:n8n_execution_id
n8n 실행 ID로 로그 조회

#### PUT /api/ai-logs/:id
로그 업데이트 (결과 저장)

**Request Body:**
```json
{
  "post_id": "uuid",
  "status": "success",
  "is_success": true,
  "thumbnail_generated": true,
  "thumbnail_url": "https://...",
  "bannerbear_uid": "tb_xxx",
  "thumbnail_sentiment": "bullish"
}
```

---

### 내부 API (n8n용)

#### POST /api/ai-logs/internal/create
n8n 실행 시작 시 로그 생성

**Headers:**
```
X-N8N-Secret: {N8N_SECRET_KEY}
Content-Type: application/json
```

**Request Body:**
```json
{
  "n8n_execution_id": "xxx-execution-id",
  "trigger_type": "morning",
  "crawled_urls": [
    "https://reuters.com/...",
    "https://marketwatch.com/..."
  ],
  "claude_prompt_tokens": 450,
  "claude_completion_tokens": 320,
  "claude_model": "claude-3-5-sonnet-20241022"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "n8n_execution_id": "xxx-execution-id",
  "status": "pending",
  "is_success": false,
  "created_at": "2026-04-13T08:00:00Z"
}
```

#### PUT /api/ai-logs/internal/:id
n8n 실행 완료 후 로그 업데이트

**Headers:**
```
X-N8N-Secret: {N8N_SECRET_KEY}
```

**Request Body:**
```json
{
  "post_id": "uuid",
  "status": "success",
  "is_success": true,
  "thumbnail_generated": true,
  "thumbnail_url": "https://...",
  "bannerbear_uid": "tb_xxx",
  "thumbnail_sentiment": "bullish"
}
```

---

## n8n 워크플로우 통합

### 1. 로그 생성 (n8n Node 1)

n8n Workflow 시작 시:
```javascript
// Node 1: HTTP POST → Create AI Log
POST /api/ai-logs/internal/create

Headers:
X-N8N-Secret: {{env.N8N_SECRET_KEY}}

Body:
{
  "n8n_execution_id": "{{ $execution.id }}",
  "trigger_type": "{{ trigger_type }}",  // morning | afternoon | evening
  "crawled_urls": {{ crawled_urls }},
  "claude_prompt_tokens": 0,  // 초기값
  "claude_completion_tokens": 0,  // 초기값
  "claude_model": "claude-3-5-sonnet-20241022"
}
```

응답:
```javascript
// save to variable
log_id = response.body.id
```

### 2. 로그 업데이트 (워크플로우 완료 후)

```javascript
// Final Node: HTTP PUT → Update AI Log
PUT /api/ai-logs/internal/{{ log_id }}

Headers:
X-N8N-Secret: {{env.N8N_SECRET_KEY}}

Body:
{
  "post_id": "{{ post.id }}",
  "status": "success",
  "is_success": true,
  "claude_prompt_tokens": {{ claude_usage.input_tokens }},
  "claude_completion_tokens": {{ claude_usage.output_tokens }},
  "thumbnail_generated": true,
  "thumbnail_url": "{{ thumbnail.image_url }}",
  "bannerbear_uid": "{{ bannerbear.uid }}",
  "thumbnail_sentiment": "{{ post.thumbnail.sentiment }}"
}
```

### 3. 에러 처리

```javascript
// Error Handling Node
PUT /api/ai-logs/internal/{{ log_id }}

Body:
{
  "status": "failed",
  "is_success": false,
  "error_message": "{{ error.message }}"
}
```

---

## 통계 및 분석

### 비용 계산 로직

```typescript
// Claude API 비용 (2024 가격 기준)
// - 입력: $0.0008 per 1K tokens
// - 출력: $0.0024 per 1K tokens

claude_cost = (prompt_tokens * 0.0008 + completion_tokens * 0.0024) / 1000

// Bannerbear 비용
// - Starter 플랜: $49/월 (100 images)

bannerbear_cost = 49  // 월간 고정

// 총 비용
total_monthly_cost = claude_cost + bannerbear_cost
```

### 예시

- 일일 3회 실행 (08:00, 14:00, 22:00)
- 각 실행당 500 prompt tokens + 350 completion tokens
- 월 90회 실행

```
Monthly:
Claude: (90 * 500 * 0.0008 + 90 * 350 * 0.0024) / 1000 = $36 + $75.6 = $111.6
Bannerbear: $49
Total: ~$160.6/월
```

---

## 환경 변수

```bash
# .env
N8N_SECRET_KEY=your-secret-key-min-32-chars
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:3306/database
```

---

## 에러 코드

| Status | Message | 원인 |
|---|---|---|
| 400 | 이미 존재하는 n8n 실행 ID | 중복 실행 |
| 401 | x-n8n-secret 헤더가 필요 | 내부 API 인증 실패 |
| 401 | x-n8n-secret 값이 올바르지 않음 | 잘못된 비밀키 |
| 404 | AI 로그를 찾을 수 없음 | 로그 ID 없음 |

---

## 향후 개선

- [ ] Slack 통합 (실패 알림)
- [ ] Discord 웹훅 (일일 통계)
- [ ] 비용 분석 차트
- [ ] 자동 리포트 생성
- [ ] 로그 자동 아카이빙 (3개월 이상 데이터)
