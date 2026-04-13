# n8n Cloud 워크플로우 설정 가이드

**US Stock Story 자동 포스트 발행 파이프라인**

이 가이드는 n8n Cloud 무료 플랜에서 3개의 포스트 자동 발행 워크플로우를 설정하는 방법입니다.

---

## 사전 준비

### 1. n8n Cloud 계정 생성
1. [n8n.io](https://n8n.io) 방문
2. "Get Started" 클릭 → 계정 생성
3. 무료 플랜 선택

### 2. 환경 변수 및 Credentials 준비

#### 필요한 정보:
```
Backend API URL: https://api.usstockstory.com
N8N_SECRET_KEY: [Railway .env.production에 설정된 값]
ANTHROPIC_API_KEY: sk-ant-xxxxx [Claude API 키]
DISCORD_WEBHOOK_URL: https://discord.com/api/webhooks/xxxxx [Discord 알림용]
FRONTEND_URL: https://usstockstory.com
REVALIDATE_SECRET: [Frontend .env.production에 설정된 값]
```

---

## Step 1: n8n Credentials 설정

### 1-1. Anthropic API Credential 추가

1. n8n Cloud 웹사이트 로그인
2. 좌측 메뉴 → **Credentials**
3. **"+ New"** 클릭
4. **Anthropic** 검색 → 선택
5. 이름: `Anthropic - Production`
6. **API Key** 입력: `sk-ant-xxxxx`
7. **Save**

### 1-2. HTTP Authentication (n8n → Backend)

1. **Credentials** → **"+ New"**
2. **HTTP Request** 선택
3. 이름: `NestJS Backend Auth`
4. **Authentication**: Basic Auth
   - Username: (공백)
   - Password: 값을 `X-N8N-Secret: [N8N_SECRET_KEY]`로 설정

**참고**: n8n HTTP Request는 일반적으로 Authorization 헤더를 사용하는데, 커스텀 헤더 `X-N8N-Secret`을 사용하려면 각 HTTP Request 노드에서 직접 헤더를 추가해야 합니다.

---

## Step 2: 워크플로우 구조 (3개 공통)

모든 워크플로우는 다음 구조를 공유합니다:

```
1. [Schedule Trigger] → 정해진 시간에 실행
   ↓
2. [n8n AI Log 생성] → POST /api/ai-logs/internal/create
   (실행 시작 기록)
   ↓
3. [RSS 뉴스 크롤링] → HTTP Request (Reuters, MarketWatch 등)
   ↓
4. [뉴스 파싱] → JavaScript 코드로 XML 파싱
   ↓
5. [Claude API 호출] → Anthropic 모델 호출
   ↓
6. [응답 파싱] → JSON 추출 및 데이터 정리
   ↓
7. [포스트 발행] → POST /api/posts/internal/publish
   ↓
8. [ISR 재검증] → POST /api/revalidate (Frontend)
   ↓
9. [Discord 알림] → POST to Discord Webhook
   ↓
10. [n8n AI Log 업데이트] → PUT /api/ai-logs/internal/:id
    (실행 완료 기록)
```

---

## Step 3: 워크플로우 1 - 프리마켓 브리핑 (08:00 KST)

### 워크플로우 이름
`01-morning-briefing`

### 3-1. Schedule Trigger 설정

1. n8n 좌측 패널 → **"+ Add node"**
2. **Schedule** 검색 → **Schedule Trigger** 선택
3. **Interval**: Cron expression 선택
4. **Cron Expression**: `0 23 * * *` (UTC 23:00 = KST 08:00 next day)
   - 또는 Manual 선택하여 테스트

### 3-2. HTTP Request - n8n 로그 생성

1. **"+ Add node"**
2. **HTTP Request** 검색 및 선택
3. 설정:
   - **Method**: POST
   - **URL**: `https://api.usstockstory.com/api/ai-logs/internal/create`
   - **Headers**: 
     ```
     x-n8n-secret: [N8N_SECRET_KEY]
     Content-Type: application/json
     ```
   - **Body** (JSON):
     ```json
     {
       "trigger_type": "morning",
       "trigger_time": "{{ now() }}"
     }
     ```
4. **Send Query Parameters**: OFF
5. Response 검증 후 저장

**Output 변수명**: 이후 참조를 위해 `logResponse` 등으로 설정 가능

### 3-3. HTTP Request - RSS 뉴스 크롤링

1. **"+ Add node"** → **HTTP Request**
2. 설정:
   - **Method**: GET
   - **URL**: `https://feeds.reuters.com/reuters/businessNews` (또는 다른 RSS URL)
   - **Headers**: (추가 불필요)
3. **Response Format**: JSON (XML 자동 파싱)

### 3-4. Function - 뉴스 파싱

1. **"+ Add node"** → **Function** (JavaScript Code)
2. 코드:
   ```javascript
   // 최신 뉴스 5개 추출
   const items = $input.all()[0].json?.rss?.channel?.[0]?.item || [];
   const latestNews = items.slice(0, 5).map(item => ({
     title: item.title?.[0] || '',
     link: item.link?.[0] || '',
     description: item.description?.[0] || '',
     pubDate: item.pubDate?.[0] || ''
   }));
   
   return [{ json: { news: latestNews } }];
   ```

### 3-5. HTTP Request - Claude API 호출

1. **"+ Add node"** → **HTTP Request**
2. 설정:
   - **Method**: POST
   - **URL**: `https://api.anthropic.com/v1/messages`
   - **Headers**:
     ```
     x-api-key: [ANTHROPIC_API_KEY]
     anthropic-version: 2023-06-01
     Content-Type: application/json
     ```
   - **Body** (JSON):
     ```json
     {
       "model": "claude-haiku-4-5-20241001",
       "max_tokens": 1024,
       "system": "당신은 미국 주식 시장 전문 기자입니다. 한국 개인 투자자를 위해 뉴스를 분석합니다. JSON 형식으로 응답하세요: {\"title\": \"...\", \"slug\": \"title-to-slug\", \"excerpt\": \"...\", \"content_md\": \"...\", \"category_slug\": \"market-trend\", \"tags\": [\"...\"]}",
       "messages": [
         {
           "role": "user",
           "content": "오늘 미국 프리마켓 동향을 한국어로 정리해주세요.\n\n뉴스:\n{{ JSON.stringify($input.all()[0].json.news) }}"
         }
       ]
     }
     ```

### 3-6. Function - 응답 파싱

1. **"+ Add node"** → **Function**
2. 코드:
   ```javascript
   const response = $input.all()[0].json;
   const content = response.content?.[0]?.text || '{}';
   
   try {
     const parsed = JSON.parse(content);
     return [{
       json: {
         title: parsed.title,
         slug: parsed.slug,
         excerpt: parsed.excerpt,
         content_md: parsed.content_md,
         category_slug: parsed.category_slug || 'market-trend',
         tags: parsed.tags || [],
         trigger_type: 'morning'
       }
     }];
   } catch (e) {
     return [{ json: { error: 'Failed to parse Claude response' } }];
   }
   ```

### 3-7. HTTP Request - 포스트 발행 API

1. **"+ Add node"** → **HTTP Request**
2. 설정:
   - **Method**: POST
   - **URL**: `https://api.usstockstory.com/api/posts/internal/publish`
   - **Headers**:
     ```
     x-n8n-secret: [N8N_SECRET_KEY]
     Content-Type: application/json
     ```
   - **Body** (JSON):
     ```json
     {
       "title": "{{ $input.all()[0].json.title }}",
       "slug": "{{ $input.all()[0].json.slug }}",
       "excerpt": "{{ $input.all()[0].json.excerpt }}",
       "content_md": "{{ $input.all()[0].json.content_md }}",
       "category_id": "market-trend",
       "tags": {{ JSON.stringify($input.all()[0].json.tags) }},
       "ai_source_urls": [],
       "is_ai_generated": true
     }
     ```

### 3-8. HTTP Request - ISR 재검증

1. **"+ Add node"** → **HTTP Request**
2. 설정:
   - **Method**: POST
   - **URL**: `https://usstockstory.com/api/revalidate`
   - **Headers**:
     ```
     x-revalidate-secret: [REVALIDATE_SECRET]
     Content-Type: application/json
     ```
   - **Body** (JSON):
     ```json
     {
       "slug": "{{ $input.all()[0].json.slug }}"
     }
     ```

### 3-9. HTTP Request - Discord 알림

1. **"+ Add node"** → **HTTP Request**
2. 설정:
   - **Method**: POST
   - **URL**: `[DISCORD_WEBHOOK_URL]`
   - **Body** (JSON):
     ```json
     {
       "embeds": [
         {
           "title": "🌍 프리마켓 브리핑 발행",
           "description": "{{ $input.all()[0].json.title }}",
           "url": "https://usstockstory.com/post/{{ $input.all()[0].json.slug }}",
           "color": 3447003,
           "timestamp": "{{ new Date().toISOString() }}"
         }
       ]
     }
     ```

### 3-10. HTTP Request - n8n 로그 업데이트

1. **"+ Add node"** → **HTTP Request**
2. 설정:
   - **Method**: PUT
   - **URL**: `https://api.usstockstory.com/api/ai-logs/internal/[logId]` 
     (Step 2의 응답에서 ID 참조)
   - **Headers**:
     ```
     x-n8n-secret: [N8N_SECRET_KEY]
     Content-Type: application/json
     ```
   - **Body** (JSON):
     ```json
     {
       "status": "success",
       "is_success": true,
       "post_id": "{{ $input.all()[0].json.id }}",
       "n8n_execution_id": "{{ $execution.id }}",
       "claude_model": "claude-haiku-4-5-20241001"
     }
     ```

---

## Step 4: 워크플로우 2 - 점심 심층분석 (14:00 KST)

**워크플로우 이름**: `02-afternoon-analysis`

### 차이점:
- **Schedule Cron**: `0 5 * * *` (UTC 05:00 = KST 14:00)
- **RSS URL**: `https://feeds.seekingalpha.com/feed/latest-articles.xml` (또는 MarketWatch)
- **Claude Prompt**: "오늘 주목할 만한 미국 주식 종목을 심층 분석해주세요..."
- **category_slug**: `stock-analysis`
- **trigger_type**: `afternoon`
- **Discord 제목**: `📈 주식 심층 분석 발행`

구조는 워크플로우 1과 동일합니다.

---

## Step 5: 워크플로우 3 - 저녁 마감 리캡 (22:00 KST)

**워크플로우 이름**: `03-evening-recap`

### 차이점:
- **Schedule Cron**: `0 13 * * *` (UTC 13:00 = KST 22:00)
- **RSS URL**: `https://feeds.bloomberg.com/markets/news.rss` (또는 AP News)
- **Claude Prompt**: "오늘 미국 증시 마감을 한국 투자자 관점으로 요약해주세요..."
- **category_slug**: `market-trend`
- **trigger_type**: `evening`
- **Discord 제목**: `🌙 증시 마감 리캡 발행`

---

## Step 6: 워크플로우 테스트

### 로컬 테스트 (Schedule 제외)

1. 워크플로우 우측 상단 **"Test Workflow"** 클릭
2. 각 노드를 순차적으로 실행하여 데이터 흐름 확인
3. 최종 API 응답이 성공(200, 201)인지 확인

### Manual Trigger로 테스트

1. Schedule Trigger를 **Manual**로 변경
2. **"Activate"** 클릭
3. **"Execute Workflow"** 버튼으로 수동 실행
4. 포스트가 발행되는지 확인

### 배포 후 스케줄링

1. Schedule Trigger를 **Cron 표현식**으로 변경
2. **"Activate"** 클릭 → 워크플로우 활성화
3. 지정된 시간에 자동 실행

---

## 문제 해결

### n8n에서 401 Unauthorized 에러

- `X-N8N-Secret` 헤더 값이 Backend `.env.production`의 `N8N_SECRET_KEY`와 일치하는지 확인
- 헤더 대소문자 확인 (정확히 `x-n8n-secret`)

### Claude API 429 (Rate Limit) 에러

- n8n에서 Rate Limit을 자동으로 재시도하도록 설정
- 또는 Cron 표현식을 조정하여 실행 간격 증가

### 포스트가 중복 발행되는 경우

- `slug` 값이 고유한지 확인
- Backend는 slug 중복 시 ConflictException 반환

### ISR 재검증 실패

- `REVALIDATE_SECRET`이 Frontend `.env.production`과 일치하는지 확인
- Frontend가 배포되었는지 확인 (localhost:3000이 아닌 실제 도메인)

---

## 모니터링

1. n8n Cloud **Executions** 탭에서 각 워크플로우의 실행 로그 확인
2. Backend `/admin/ai-logs` 페이지에서 AI 로그 모니터링
3. Discord 채널에서 알림 확인

---

## 비용 및 한계

- **n8n Cloud 무료 플랜**: 월 5000 실행 (충분함: 3 워크플로우 × 30일 = 90 실행)
- **Claude API 비용**: 약 $1~2/월 (3포스트/일 기준)
- **총 자동화 비용**: ~$1-2/월

---

## 참고

- n8n 문서: https://docs.n8n.io/
- Claude API: https://docs.anthropic.com/
- RSS Feed URL: https://www.rssboard.org/rss-specification
