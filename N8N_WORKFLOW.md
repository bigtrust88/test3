# n8n 자동화 워크플로우 상세 명세

## 개요

3개의 독립적인 n8n 워크플로우를 매일 3회 실행 (08:00/14:00/22:00 KST).
각 워크플로우는 뉴스 크롤링 → Claude API → 자동 발행까지 전체 파이프라인을 처리.

---

## 1. 워크플로우 구조 (공통)

```
[Schedule Trigger (Cron)]
    ↓
[Set Context Variables]
    ↓
[RSS Feed Aggregation (병렬)]
    ├─ Reuters 비즈니스 뉴스
    ├─ MarketWatch 최신 뉴스
    ├─ CNBC 속보
    ├─ Seeking Alpha 헤드라인
    └─ Investing.com 뉴스
    ↓
[Deduplication Check] → 최근 7일 크롤링 소스와 비교
    ↓
[Claude API Call] → JSON 생성
    ↓
[Validation] → JSON 형식 검증
    ↓
[NestJS API Call] → /api/internal/posts/publish
    ↓
[ISR Revalidation] → Next.js 캐시 갱신
    ↓
[Notification] → Discord/Telegram
    ↓
[Logging] → ai_post_logs 저장
```

---

## 2. 워크플로우 상세 설정 (3개)

### 2.1 워크플로우 #1: 프리마켓 브리핑 (08:00 KST)

**이름**: `Stock Blog - Morning Pre-market (08:00)`
**Cron**: `0 8 * * *` (매일 08:00 KST)

#### Node 1: Schedule Trigger
```
Type: Cron
Cron Expression: 0 8 * * *
Timezone: Asia/Seoul
```

#### Node 2: Set Context
```
Type: Execute Code (JavaScript)

Code:
return {
  "post_type": "morning",
  "time_kst": new Date().toISOString(),
  "target_hours": "8am-8:30am",
  "context": "US market close (previous day) + pre-market futures"
};

Output: 
{
  "post_type": "morning",
  "time_kst": "2025-04-13T08:00:00+09:00",
  "target_hours": "8am-8:30am",
  "context": "US market close + premarket"
}
```

#### Node 3-7: RSS Feed Aggregation (병렬)

**Node 3: Reuters Business Feed**
```
Type: HTTP Request (RSS)
URL: https://feeds.reuters.com/reuters/businessNews
Method: GET
Params:
- format: RSS (자동)

Output: Array of news items
```

**Node 4: MarketWatch**
```
Type: HTTP Request (RSS)
URL: https://feeds.marketwatch.com/marketwatch/topstories/
Output: Array
```

**Node 5: CNBC**
```
Type: HTTP Request (RSS)
URL: https://feeds.cnbc.com/cnbc/intl/world/
Output: Array
```

**Node 6: Seeking Alpha**
```
Type: HTTP Request (RSS)
URL: https://feeds.seekingalpha.com/feed.xml
Output: Array
```

**Node 7: Investing.com**
```
Type: HTTP Request (RSS)
URL: https://feeds.investing.com/feeds/news_301.xml
Output: Array
```

#### Node 8: Merge & Parse RSS

```
Type: Execute Code (JavaScript)

Input: [reuters_items, marketwatch_items, cnbc_items, seekingalpha_items, investing_items]

Code:
const allNews = [
  ...$input.all()[0],  // Reuters
  ...($input.all()[1] || []),  // MarketWatch
  ...($input.all()[2] || []),  // CNBC
  ...($input.all()[3] || []),  // Seeking Alpha
  ...($input.all()[4] || [])   // Investing
];

// 최신 뉴스 3개만 선택 (아침 버리핑은 신속성 중요)
const sorted = allNews.sort((a, b) => 
  new Date(b.pubDate) - new Date(a.pubDate)
).slice(0, 3);

return {
  "news": sorted.map(item => ({
    "title": item.title,
    "source": item.source,
    "url": item.link,
    "published_at": item.pubDate,
    "summary": item.description
  })),
  "count": sorted.length
};

Output:
{
  "news": [
    {
      "title": "S&P 500 hits record high...",
      "source": "Reuters",
      "url": "https://reuters.com/...",
      "published_at": "2025-04-12T21:30:00Z",
      "summary": "..."
    },
    ...
  ],
  "count": 3
}
```

#### Node 9: Deduplication Check

```
Type: HTTP Request (NestJS Internal API)
Method: GET
URL: https://api.usstockstory.com/api/internal/recent-sources?days=7

Header:
X-N8N-Secret: {{$env.N8N_SHARED_SECRET}}

Output:
{
  "sources": [
    { "url": "https://reuters.com/...", "crawled_at": "2025-04-12T08:00:00Z" },
    ...
  ]
}
```

#### Node 10: Filter Duplicates

```
Type: Execute Code (JavaScript)

Input: {news, sources}

Code:
const existingUrls = new Set($input.all()[1].sources.map(s => s.url));

const uniqueNews = $input.all()[0].news.filter(item => 
  !existingUrls.has(item.url)
);

return {
  "news": uniqueNews,
  "original_count": $input.all()[0].count,
  "filtered_count": uniqueNews.length,
  "duplicates_removed": $input.all()[0].count - uniqueNews.length
};

Output:
{
  "news": [...3 unique items...],
  "original_count": 3,
  "filtered_count": 3,
  "duplicates_removed": 0
}
```

#### Node 11: Claude API Call

```
Type: HTTP Request
Method: POST
URL: https://api.anthropic.com/v1/messages

Headers:
Content-Type: application/json
x-api-key: {{$env.ANTHROPIC_API_KEY}}
anthropic-version: 2023-06-01

Body:
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1000,
  "system": "{{$env.CLAUDE_SYSTEM_PROMPT_MORNING}}",
  "messages": [
    {
      "role": "user",
      "content": "{{$json.user_prompt}}"
    }
  ]
}

// user_prompt은 Node에서 동적 생성
// 생성 시점: Node 11 전에 Execute Code 노드에서 생성
```

#### Node 11-1 (Node 11 전): Generate User Prompt

```
Type: Execute Code (JavaScript)

Input: {post_type, news}

Code:
const newsJson = JSON.stringify($input.all()[0].news, null, 2);

const userPrompt = `[발행 유형: morning]
[발행 시간: 2025-04-13T08:00:00+09:00]

다음은 최신 미국 금융 뉴스입니다. 아침 프리마켓 브리핑 포스트를 작성해주세요.

## 크롤링된 뉴스 헤드라인

${newsJson}

## 출력 형식

반드시 다음의 JSON 형식으로만 응답하세요:
{
  "title": "...",
  "slug": "...",
  "excerpt": "...",
  "content_md": "...",
  "tags": [...],
  "category_slug": "시장동향"
}`;

return { "user_prompt": userPrompt };
```

#### Node 12: Parse Claude Response

```
Type: Execute Code (JavaScript)

Input: Claude API response (raw text in content[0].text)

Code:
const responseText = $input.all()[0].content[0].text;

// JSON 추출 (```json ... ``` 형식 대비)
const jsonMatch = responseText.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  throw new Error("No JSON found in Claude response");
}

const parsed = JSON.parse(jsonMatch[0]);

return {
  "title": parsed.title,
  "slug": parsed.slug,
  "excerpt": parsed.excerpt,
  "content_md": parsed.content_md,
  "tags": parsed.tags,
  "category_slug": parsed.category_slug,
  "raw_response": responseText
};
```

#### Node 13: Validation

```
Type: Execute Code (JavaScript)

Input: Parsed Claude response

Code:
const post = $input.all()[0];
const errors = [];

// 필드 존재 확인
if (!post.title) errors.push("title is required");
if (!post.slug) errors.push("slug is required");
if (!post.excerpt) errors.push("excerpt is required");
if (!post.content_md) errors.push("content_md is required");
if (!Array.isArray(post.tags) || post.tags.length < 3) 
  errors.push("tags must be array with 3-5 items");
if (!post.category_slug) errors.push("category_slug is required");

// 길이 검증
if (post.title.length < 40 || post.title.length > 60)
  errors.push("title must be 40-60 characters");
if (post.excerpt.length < 100 || post.excerpt.length > 150)
  errors.push("excerpt must be 100-150 characters");

// 카테고리 검증
const validCategories = ["종목분석", "시장동향", "etf-분석", "실적발표", "투자전략"];
if (!validCategories.includes(post.category_slug))
  errors.push("invalid category");

if (errors.length > 0) {
  throw new Error(`Validation failed: ${errors.join(", ")}`);
}

return { "valid": true, "post": post };
```

#### Node 14: NestJS Publish API

```
Type: HTTP Request
Method: POST
URL: https://api.usstockstory.com/api/internal/posts/publish

Headers:
X-N8N-Secret: {{$env.N8N_SHARED_SECRET}}
Content-Type: application/json

Body:
{
  "title": "{{$json.post.title}}",
  "slug": "{{$json.post.slug}}",
  "excerpt": "{{$json.post.excerpt}}",
  "content_md": "{{$json.post.content_md}}",
  "category_slug": "{{$json.post.category_slug}}",
  "tags": {{JSON.stringify($json.post.tags)}},
  "is_ai_generated": true,
  "n8n_execution_id": "{{$execution.id}}",
  "crawled_urls": {{JSON.stringify($input.all()[0].news.map(n => n.url))}},
  "claude_model": "claude-3-5-sonnet-20241022",
  "claude_prompt_tokens": 450,
  "claude_completion_tokens": 320
}

Response Handling:
- Success (201): 포스트 발행 완료
- Error (400): Node 15-Error로 진행
```

#### Node 15: ISR Revalidation

```
Type: HTTP Request
Method: POST
URL: https://api.usstockstory.com/api/internal/revalidate

Headers:
X-N8N-Secret: {{$env.N8N_SHARED_SECRET}}

Body:
{
  "paths": [
    "/",
    "/post/{{$json.slug}}",
    "/시장동향"
  ]
}
```

#### Node 16: Discord Notification (Success)

```
Type: HTTP Request
Method: POST
URL: {{$env.DISCORD_WEBHOOK_URL}}

Body (JSON):
{
  "content": "",
  "embeds": [
    {
      "title": "✅ 포스트 자동 발행 완료",
      "description": "{{$json.title}}",
      "color": 5763719,
      "fields": [
        {
          "name": "카테고리",
          "value": "{{$json.category_slug}}",
          "inline": true
        },
        {
          "name": "태그",
          "value": "{{$json.tags.join(', ')}}",
          "inline": true
        },
        {
          "name": "URL",
          "value": "https://usstockstory.com/post/{{$json.slug}}",
          "inline": false
        },
        {
          "name": "시간",
          "value": "{{new Date().toLocaleString('ko-KR')}}",
          "inline": true
        }
      ]
    }
  ]
}
```

#### Node 17: Logging

```
Type: HTTP Request
Method: POST
URL: https://api.usstockstory.com/api/internal/ai-logs

Headers:
X-N8N-Secret: {{$env.N8N_SHARED_SECRET}}

Body:
{
  "post_id": "{{$json.post_id}}",
  "n8n_execution_id": "{{$execution.id}}",
  "status": "success",
  "crawled_urls": {{JSON.stringify($input.all()[0].urls)}},
  "claude_model": "claude-3-5-sonnet-20241022",
  "claude_prompt_tokens": 450,
  "claude_completion_tokens": 320,
  "error_message": null
}
```

#### Node 18: Error Handler

```
Type: Notification / HTTP Request (Discord - Error)

Trigger: On any node failure

Body:
{
  "content": "",
  "embeds": [
    {
      "title": "❌ 포스트 자동 발행 실패",
      "description": "{{$error.message}}",
      "color": 15158332,
      "fields": [
        {
          "name": "n8n 실행 ID",
          "value": "{{$execution.id}}",
          "inline": false
        },
        {
          "name": "실패한 노드",
          "value": "{{$error.node}}",
          "inline": true
        },
        {
          "name": "시간",
          "value": "{{new Date().toLocaleString('ko-KR')}}",
          "inline": true
        },
        {
          "name": "상세 에러",
          "value": "```\n{{$error.message}}\n```",
          "inline": false
        }
      ]
    }
  ]
}
```

#### Logging (Error)
```
POST /api/internal/ai-logs

Body:
{
  "post_id": null,
  "n8n_execution_id": "{{$execution.id}}",
  "status": "failed",
  "crawled_urls": [],
  "claude_model": "claude-3-5-sonnet-20241022",
  "claude_prompt_tokens": 0,
  "claude_completion_tokens": 0,
  "error_message": "{{$error.message}}"
}
```

---

### 2.2 워크플로우 #2: 점심 심층분석 (14:00 KST)

**이름**: `Stock Blog - Afternoon Analysis (14:00)`
**Cron**: `0 14 * * *`

**차이점**:
- Node 2 Context: `post_type: "afternoon"`, `context: "Specific stock/ETF deep analysis"`
- Node 8: 뉴스 5개 선택 (점심은 깊이 있는 분석, 아침보다 더 많은 정보)
- Claude System Prompt: `CLAUDE_SYSTEM_PROMPT_AFTERNOON` (깊이 있는 분석)
- Node 16 Discord: "📊 종목 심층분석" 타이틀

**동일한 구조**: Node 1~18 동일 로직, 파라미터만 변경

---

### 2.3 워크플로우 #3: 저녁 마감 리캡 (22:00 KST)

**이름**: `Stock Blog - Evening Recap (22:00)`
**Cron**: `0 22 * * *`

**차이점**:
- Node 2 Context: `post_type: "evening"`, `context: "US market close recap + tomorrow strategy"`
- Node 8: 뉴스 5개 (종합 분석)
- Claude System Prompt: `CLAUDE_SYSTEM_PROMPT_EVENING` (종합적이고 다음날 전략)
- Node 16 Discord: "📈 마감 리캡" 타이틀

---

## 3. RSS 피드 목록 및 설정

### 3.1 권장 RSS 피드

| 피드 | URL | 업데이트 빈도 | 선호도 |
|---|---|---|---|
| Reuters Business | `https://feeds.reuters.com/reuters/businessNews` | 실시간 | ⭐⭐⭐⭐⭐ |
| MarketWatch | `https://feeds.marketwatch.com/marketwatch/topstories/` | 5분 | ⭐⭐⭐⭐⭐ |
| CNBC | `https://feeds.cnbc.com/cnbc/intl/world/` | 실시간 | ⭐⭐⭐⭐ |
| Seeking Alpha | `https://feeds.seekingalpha.com/feed.xml` | 10분 | ⭐⭐⭐⭐ |
| Investing.com | `https://feeds.investing.com/feeds/news_301.xml` | 5분 | ⭐⭐⭐ |
| Yahoo Finance | `https://feeds.finance.yahoo.com/` | 실시간 | ⭐⭐⭐ |
| Wall Street Journal | `https://feeds.wsj.com/xml/rss/3_7085.xml` | 10분 | ⭐⭐⭐ |

### 3.2 RSS 파싱 설정

```javascript
// n8n Execute Code에서 RSS 파싱
const parser = require('rss-parser');
const feed = await parser.parseURL(rss_url);

return {
  "title": feed.items[0].title,
  "source": feed.title,
  "url": feed.items[0].link,
  "published_at": feed.items[0].pubDate,
  "summary": feed.items[0].content || feed.items[0].contentSnippet
};
```

---

## 4. 환경 변수 (n8n)

```bash
# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# System Prompts (3개)
CLAUDE_SYSTEM_PROMPT_MORNING="당신은 미국 주식 시장 전문가입니다... [아침 설정]"
CLAUDE_SYSTEM_PROMPT_AFTERNOON="당신은 종목 분석 전문가입니다... [점심 설정]"
CLAUDE_SYSTEM_PROMPT_EVENING="당신은 시장 해설가입니다... [저녁 설정]"

# NestJS API
N8N_SHARED_SECRET=your-shared-secret-key
NESTJS_API_BASE_URL=https://api.usstockstory.com

# 알림
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=-987654

# 기타
LOG_LEVEL=info
RETRY_ATTEMPTS=3
RETRY_DELAY=5000
```

---

## 5. 에러 시나리오 및 대응

### 5.1 RSS 피드 다운로드 실패

```
→ 다른 피드 시도 (5개 중 3개 성공하면 진행)
→ 모두 실패 시 Discord 알림: "RSS 크롤링 실패"
```

### 5.2 Claude API 타임아웃

```
→ 재시도 (3회, 5초 간격)
→ 계속 실패 시 ai_post_logs: status="failed", error="Claude API timeout"
→ 관리자 수동 개입
```

### 5.3 NestJS API 에러 (400/500)

```
→ 응답 로깅
→ Discord 알림: "NestJS API 에러: [상태 코드] [에러 메시지]"
→ ai_post_logs에 상세 기록
```

### 5.4 JSON 검증 실패

```
→ Claude에게 "JSON 형식 오류, 다시 작성해주세요" 메시지 전송
→ 재시도 1회
→ 계속 실패 시 status="review_needed" → 관리자 검토 필요
```

---

## 6. 성능 최적화

### 6.1 병렬 RSS 페칭

5개의 RSS 피드를 동시에 요청 (직렬이 아닌 병렬):
- Node 3~7을 병렬 실행
- 평균 응답 시간: 3~5초 (직렬이면 15~25초)

### 6.2 캐싱

- 중복 검사 (최근 7일 소스): Redis 캐시 활용
- Claude 응답: 캐시 안 함 (항상 신규 생성)

### 6.3 토큰 절약

- System Prompt: 재사용 (캐싱됨)
- 뉴스 요약: 짧은 요약 사용 (토큰 절약)
- 응답 토큰 제한: `max_tokens=1000`

---

## 7. 모니터링 대시보드 (권장)

n8n UI에서:
- 각 워크플로우 실행 히스토리 확인
- 평균 실행 시간 추적
- 에러율 모니터링

ai_post_logs 테이블에서:
- 성공률 계산: success / total
- 토큰 사용량 추적
- 실행 시간 분석
