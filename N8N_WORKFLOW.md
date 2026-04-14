# n8n 워크플로우 상세 명세 (bigtrust.site)

> **이 문서는 N8N-QUICK-START.md의 심화 버전입니다.**  
> 각 노드의 상세 설정이 필요할 때 참고하세요.

---

## 현재 서버 정보

| 항목 | 값 |
|------|-----|
| 프론트엔드 | `https://bigtrust.site` |
| 백엔드 API | `https://api.bigtrust.site` |
| 저장소 | `https://github.com/bigtrust88/test3` |
| 배포 플랫폼 | Vercel (프론트) + Railway (백엔드) |

---

## 1. 워크플로우 전체 구조

```
[1] Schedule Trigger     ← 매일 08:00 / 14:00 / 22:00 KST 실행
        ↓
[2] RSS 뉴스 수집        ← Reuters 등에서 최신 뉴스 3-5개 가져오기
        ↓
[3] 뉴스 파싱/정리       ← 제목, 요약, URL 추출
        ↓
[4] Claude API 호출      ← 뉴스를 바탕으로 한국어 블로그 글 작성 요청
        ↓
[5] 응답 JSON 파싱       ← Claude의 응답에서 title, content_md 등 추출
        ↓
[6] 포스트 발행 API      ← api.bigtrust.site에 포스트 저장
        ↓
[7] ISR 캐시 갱신        ← bigtrust.site Vercel 캐시 갱신
        ↓
[8] Discord 알림         ← (선택) 발행 완료 알림
```

---

## 2. 3개 워크플로우 설정 차이점

| 항목 | 01-morning | 02-afternoon | 03-evening |
|------|-----------|--------------|------------|
| 실행 시간 (KST) | 08:00 | 14:00 | 22:00 |
| Cron (UTC) | `0 23 * * *` | `0 5 * * *` | `0 13 * * *` |
| post_type | `morning` | `afternoon` | `evening` |
| 뉴스 개수 | 3개 | 5개 | 5개 |
| 분석 방향 | 프리마켓 브리핑 | 종목 심층분석 | 마감 리캡 + 내일 전략 |

---

## 3. 노드별 상세 설정

### Node 1: Schedule Trigger

```
설정:
- Trigger Rule: Cron Expression
- Timezone: Asia/Seoul

워크플로우별 Cron:
- 01-morning:   0 23 * * *   (UTC 23:00 = KST 08:00)
- 02-afternoon: 0 5 * * *    (UTC 05:00 = KST 14:00)
- 03-evening:   0 13 * * *   (UTC 13:00 = KST 22:00)
```

---

### Node 2: RSS 뉴스 수집 (HTTP Request)

```
Method: GET
Response Format: Auto-detect

권장 RSS 피드 URL (하나 선택):
1. Reuters Business:  https://feeds.reuters.com/reuters/businessNews
2. MarketWatch:       https://feeds.marketwatch.com/marketwatch/topstories/
3. CNBC:              https://feeds.cnbc.com/cnbc/intl/world/
4. Yahoo Finance:     https://finance.yahoo.com/news/rssindex
```

> 💡 여러 피드를 동시에 수집하려면 Node 2를 복수 추가하고 Merge Node로 합치세요.

---

### Node 3: 뉴스 파싱/정리 (Code Node)

```javascript
// 워크플로우 타입 설정 (워크플로우마다 변경)
const POST_TYPE = 'morning';  // morning | afternoon | evening
const NEWS_COUNT = 3;         // morning: 3, afternoon/evening: 5

const items = $input.all();
const newsItems = [];

for (let i = 0; i < Math.min(NEWS_COUNT, items.length); i++) {
  const item = items[i].json;
  newsItems.push({
    title: item.title || '제목 없음',
    summary: item.contentSnippet || item.description || '',
    url: item.link || '',
    published: item.pubDate || new Date().toISOString(),
    source: 'Reuters'
  });
}

if (newsItems.length === 0) {
  throw new Error('수집된 뉴스가 없습니다. RSS 피드를 확인하세요.');
}

return [{
  json: {
    post_type: POST_TYPE,
    news: newsItems,
    news_count: newsItems.length,
    collected_at: new Date().toISOString()
  }
}];
```

---

### Node 4: Claude API 호출 (HTTP Request)

```
Method: POST
URL: https://api.anthropic.com/v1/messages
```

**Headers:**
```
Content-Type: application/json
x-api-key: [ANTHROPIC_API_KEY]
anthropic-version: 2023-06-01
```

**Body (JSON):**

#### 아침 프리마켓용 System Prompt (`01-morning`):
```json
{
  "model": "claude-haiku-4-5-20251001",
  "max_tokens": 2000,
  "system": "당신은 한국 개인 투자자를 위한 미국 프리마켓 브리핑 전문가입니다. 매일 아침 미국 시장 개장 전 주요 뉴스를 분석하여 한국 투자자가 오늘 무엇에 주목해야 하는지 안내합니다. 반드시 JSON 형식으로만 응답하세요.",
  "messages": [
    {
      "role": "user",
      "content": "={{ '오늘 아침 프리마켓 브리핑을 작성해주세요.\n\n최신 뉴스:\n' + JSON.stringify($json.news, null, 2) + '\n\n아래 JSON 형식으로만 응답 (다른 설명 없이):\n{\n  \"title\": \"[오늘 날짜] 미국 프리마켓 브리핑: [핵심 키워드]\",\n  \"slug\": \"morning-briefing-' + new Date().toISOString().slice(0,10) + '\",\n  \"excerpt\": \"오늘 주목해야 할 미국 주식 시장 동향 (100-150자)\",\n  \"content_md\": \"## 오늘의 핵심 뉴스\\n\\n[마크다운 본문 500자 이상]\",\n  \"tags\": [\"프리마켓\", \"미국주식\", \"시장동향\"],\n  \"category_slug\": \"시장동향\"\n}' }}"
    }
  ]
}
```

#### 오후 심층분석용 System Prompt (`02-afternoon`):
```json
{
  "model": "claude-haiku-4-5-20251001",
  "max_tokens": 2000,
  "system": "당신은 미국 주식 종목 분석 전문가입니다. 뉴스를 바탕으로 특정 종목이나 섹터의 심층 분석 콘텐츠를 작성합니다. 한국 투자자의 관점에서 실용적인 인사이트를 제공하세요. 반드시 JSON 형식으로만 응답하세요.",
  "messages": [
    {
      "role": "user",
      "content": "={{ '오늘 오후 종목 심층분석을 작성해주세요.\n\n관련 뉴스:\n' + JSON.stringify($json.news, null, 2) + '\n\n아래 JSON 형식으로만 응답:\n{\n  \"title\": \"[종목명] 심층분석: [핵심 키워드]\",\n  \"slug\": \"afternoon-analysis-' + new Date().toISOString().slice(0,10) + '\",\n  \"excerpt\": \"오늘 주목할 미국 주식 종목 분석 (100-150자)\",\n  \"content_md\": \"## 종목 분석\\n\\n[마크다운 본문 500자 이상]\",\n  \"tags\": [\"종목분석\", \"미국주식\", \"투자전략\"],\n  \"category_slug\": \"종목분석\"\n}' }}"
    }
  ]
}
```

#### 저녁 마감 리캡용 System Prompt (`03-evening`):
```json
{
  "model": "claude-haiku-4-5-20251001",
  "max_tokens": 2000,
  "system": "당신은 미국 증시 마감 분석 전문가입니다. 하루 시장을 총정리하고 내일 전략을 제시합니다. 한국 투자자가 내일 어떻게 대응해야 할지 명확한 방향을 제시하세요. 반드시 JSON 형식으로만 응답하세요.",
  "messages": [
    {
      "role": "user",
      "content": "={{ '오늘 미국 증시 마감 리캡을 작성해주세요.\n\n오늘 뉴스:\n' + JSON.stringify($json.news, null, 2) + '\n\n아래 JSON 형식으로만 응답:\n{\n  \"title\": \"[날짜] 미국 증시 마감: [핵심 키워드]\",\n  \"slug\": \"evening-recap-' + new Date().toISOString().slice(0,10) + '\",\n  \"excerpt\": \"오늘 미국 증시 마감 총정리와 내일 전략 (100-150자)\",\n  \"content_md\": \"## 오늘 시장 총정리\\n\\n[마크다운 본문 500자 이상]\",\n  \"tags\": [\"마감리캡\", \"미국증시\", \"내일전략\"],\n  \"category_slug\": \"시장동향\"\n}' }}"
    }
  ]
}
```

---

### Node 5: 응답 JSON 파싱 (Code Node)

```javascript
// Claude 응답에서 JSON 추출
const response = $input.first().json;
const responseText = response.content[0].text;

console.log('Claude 원본 응답:', responseText.substring(0, 500));

// JSON 블록 추출 (```json ... ``` 형식 포함 대응)
let jsonText = responseText;

// 마크다운 코드 블록 제거
const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
if (codeBlockMatch) {
  jsonText = codeBlockMatch[1];
}

// JSON 객체 추출
const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  throw new Error('JSON을 찾을 수 없습니다. Claude 응답: ' + responseText.substring(0, 300));
}

let post;
try {
  post = JSON.parse(jsonMatch[0]);
} catch (e) {
  throw new Error('JSON 파싱 실패: ' + e.message);
}

// 필수 필드 검증
const required = ['title', 'slug', 'excerpt', 'content_md', 'tags', 'category_slug'];
const missing = required.filter(f => !post[f]);
if (missing.length > 0) {
  throw new Error('필수 필드 누락: ' + missing.join(', '));
}

// tags가 배열인지 확인
if (!Array.isArray(post.tags)) {
  post.tags = [post.tags];
}

console.log('파싱된 포스트 제목:', post.title);

return [{ json: post }];
```

---

### Node 6: 포스트 발행 API (HTTP Request)

```
Method: POST
URL: https://api.bigtrust.site/api/posts/internal/publish
```

**Headers:**
```
Content-Type: application/json
X-N8N-Secret: [Railway의 N8N_SECRET_KEY 값]
```

**Body (JSON):**
```json
{
  "title": "={{ $json.title }}",
  "slug": "={{ $json.slug }}",
  "excerpt": "={{ $json.excerpt }}",
  "content_md": "={{ $json.content_md }}",
  "category_slug": "={{ $json.category_slug }}",
  "tags": "={{ $json.tags }}",
  "is_ai_generated": true,
  "status": "published"
}
```

**응답 확인:**
- `201 Created` → 성공
- `401 Unauthorized` → X-N8N-Secret 값 오류
- `500 Internal Server Error` → 데이터베이스 연결 오류 (Railway MySQL 확인)

---

### Node 7: ISR 캐시 갱신 (HTTP Request)

```
Method: POST
URL: https://bigtrust.site/api/revalidate
```

**Headers:**
```
Content-Type: application/json
x-revalidate-secret: [Railway의 REVALIDATE_SECRET 값]
```

**Body (JSON):**
```json
{
  "paths": ["/", "/stock-analysis", "/{{ $json.category_slug }}"]
}
```

---

### Node 8: Discord 알림 (HTTP Request, 선택사항)

```
Method: POST
URL: [Discord 웹훅 URL]
```

**Body (JSON):**
```json
{
  "username": "bigtrust.site 봇",
  "embeds": [
    {
      "title": "✅ 새 포스트 발행 완료",
      "description": "={{ $json.title }}",
      "color": 5763719,
      "fields": [
        {
          "name": "카테고리",
          "value": "={{ $json.category_slug }}",
          "inline": true
        },
        {
          "name": "태그",
          "value": "={{ $json.tags.join(', ') }}",
          "inline": true
        },
        {
          "name": "포스트 링크",
          "value": "https://bigtrust.site/post/={{ $json.slug }}",
          "inline": false
        }
      ],
      "timestamp": "={{ new Date().toISOString() }}"
    }
  ]
}
```

---

## 4. n8n 환경 변수 설정 (Free 플랜)

> ⚠️ n8n 무료 플랜은 Variables 기능이 없습니다.  
> **각 노드에 값을 직접 입력**해야 합니다.

| 사용 위치 | 값 | 어디서 확인? |
|-----------|-----|-------------|
| Node 4 Header (x-api-key) | Claude API 키 | Anthropic Console |
| Node 6 Header (X-N8N-Secret) | N8N_SECRET_KEY | Railway Variables |
| Node 7 Header (x-revalidate-secret) | REVALIDATE_SECRET | Railway Variables |
| Node 8 URL | Discord 웹훅 URL | Discord 채널 설정 |

---

## 5. 에러 대응 가이드

### RSS 피드 오류 (Node 2)
```
증상: "Cannot read property 'items' of undefined"
원인: RSS 피드 URL이 변경되거나 일시 장애
해결: 다른 RSS 피드 URL로 교체
     Reuters 대안: https://feeds.finance.yahoo.com/rss/2.0/headline
```

### Claude API 오류 (Node 4)
```
증상: 401 Unauthorized
원인: API 키 오류 또는 만료
해결: Anthropic Console에서 새 API 키 발급

증상: 429 Too Many Requests
원인: API 한도 초과
해결: Anthropic 플랜 확인, 잠시 후 재시도
```

### 포스트 발행 오류 (Node 6)
```
증상: 401 Unauthorized
원인: N8N_SECRET_KEY 불일치
해결: Railway Variables의 N8N_SECRET_KEY 값과 n8n의 값이 동일한지 확인

증상: 500 Internal Server Error
원인: 데이터베이스 연결 실패
해결:
  1. Railway Dashboard → 프로젝트 → Logs 확인
  2. MySQL 플러그인이 연결되어 있는지 확인
  3. DATABASE_URL 환경 변수가 올바른지 확인
```

### ISR 갱신 오류 (Node 7)
```
증상: 401 Unauthorized
원인: REVALIDATE_SECRET 불일치
해결: Railway Variables의 REVALIDATE_SECRET 값과 n8n 값 동일하게 수정
```

---

## 6. 유효한 카테고리 슬러그

Claude에게 이 중 하나만 사용하도록 프롬프트에 명시하세요.

| 슬러그 | 한국어 이름 |
|--------|------------|
| `종목분석` | 종목 분석 |
| `시장동향` | 시장 동향 |
| `etf-분석` | ETF 분석 |
| `실적발표` | 실적 발표 |
| `투자전략` | 투자 전략 |

---

## 7. 테스트 체크리스트

워크플로우 활성화 전 반드시 테스트하세요.

- [ ] Node 2: RSS 피드에서 뉴스 수집 확인
- [ ] Node 3: 뉴스 파싱 및 JSON 구조 확인
- [ ] Node 4: Claude API 응답 확인 (JSON 형식)
- [ ] Node 5: title, slug, content_md 파싱 확인
- [ ] Node 6: `201 Created` 응답 확인
- [ ] Node 7: `{"revalidated": true}` 응답 확인
- [ ] bigtrust.site 접속 → 새 포스트 표시 확인
