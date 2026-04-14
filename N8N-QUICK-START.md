# n8n 워크플로우 빠른 시작 가이드 (bigtrust.site)

> **이 가이드의 목표**: n8n에서 자동으로 미국 주식 분석 포스트를 하루 3번 발행하는 자동화 설정하기

---

## 🧩 전체 흐름 이해하기

```
뉴스 RSS 수집 → Claude AI가 글 작성 → bigtrust.site에 자동 발행
```

매일 **08:00 / 14:00 / 22:00 KST**에 자동으로 포스트가 올라옵니다.

---

## ⚠️ 시작 전 필수 확인사항

n8n 설정 전에 **Railway 백엔드**에 다음 환경 변수가 설정되어 있어야 합니다.
Railway Dashboard → 프로젝트 → Variables 탭에서 확인하세요.

| 변수명 | 설명 | 예시 값 |
|--------|------|---------|
| `NODE_ENV` | 환경 설정 | `production` |
| `JWT_SECRET` | 로그인 암호화 키 | `임의의 32자 이상 문자열` |
| `N8N_SECRET_KEY` | n8n 인증 키 | `임의의 32자 이상 문자열` |
| `REVALIDATE_SECRET` | 페이지 갱신 키 | `임의의 32자 이상 문자열` |
| `ANTHROPIC_API_KEY` | Claude API 키 | `sk-ant-xxxxx` |
| `FRONTEND_URL` | 프론트엔드 주소 | `https://bigtrust.site` |
| `DATABASE_URL` | MySQL 주소 | Railway MySQL 자동 생성 |

> 💡 **Railway Variables가 모두 설정되어야 포스트 발행이 됩니다!**

---

## STEP 1: n8n Cloud 가입

1. [https://n8n.io](https://n8n.io) 접속
2. **"Get Started for free"** 클릭
3. 이메일로 회원가입
4. **무료 플랜** 선택 (월 2,500 실행 무료 → 하루 3번 × 30일 = 90번, 충분!)

---

## STEP 2: Claude API Credential 추가

n8n이 Claude AI를 사용하기 위한 인증 정보를 등록합니다.

1. 좌측 메뉴 → **Credentials** 클릭
2. 우상단 **"+ Add credential"** 클릭
3. 검색창에 **"Anthropic"** 입력 후 선택
4. 다음 항목 입력:
   - **Credential Name**: `Anthropic API` (이름은 자유)
   - **API Key**: `sk-ant-xxxxx` (실제 Claude API 키 입력)
5. **Save** 클릭

---

## STEP 3: 워크플로우 3개 만들기

워크플로우는 **3개**를 만들어야 합니다. 각각 실행 시간만 다르고 구조는 동일합니다.

| 워크플로우 이름 | 실행 시간 | Cron 표현식 |
|----------------|-----------|-------------|
| `01-morning-briefing` | 매일 **08:00 KST** | `0 23 * * *` (UTC) |
| `02-afternoon-analysis` | 매일 **14:00 KST** | `0 5 * * *` (UTC) |
| `03-evening-recap` | 매일 **22:00 KST** | `0 13 * * *` (UTC) |

> ⚠️ n8n은 **UTC 기준**으로 작동하므로 KST에서 9시간을 빼야 합니다.

### 워크플로우 만드는 방법

1. 좌측 메뉴 → **Workflows** → **"+ New Workflow"**
2. 상단 이름 클릭 → `01-morning-briefing` 입력
3. **저장 (Ctrl+S)**
4. 아래의 **Node 구성** 가이드 참고하여 노드 추가
5. 완성 후 우상단 **"Activate"** 클릭

---

## STEP 4: 각 워크플로우의 노드 구성

### 📌 노드 순서 (총 8개)

```
[1] Schedule Trigger
    ↓
[2] RSS 뉴스 가져오기 (HTTP Request)
    ↓
[3] 뉴스 정리하기 (Code)
    ↓
[4] Claude AI 포스트 작성 (HTTP Request)
    ↓
[5] AI 응답 파싱 (Code)
    ↓
[6] 포스트 발행 (HTTP Request)
    ↓
[7] 페이지 캐시 갱신 (HTTP Request)
    ↓
[8] Discord 알림 (HTTP Request) ← 선택사항
```

---

### Node 1: Schedule Trigger (시간 설정)

**추가 방법**: `+` 클릭 → "Schedule Trigger" 검색 → 선택

| 설정 항목 | 값 |
|-----------|-----|
| Trigger Rule | `Cron Expression` |
| Cron Expression | `0 23 * * *` ← 아침용 (14:00는 `0 5 * * *`, 22:00는 `0 13 * * *`) |
| Timezone | `Asia/Seoul` |

---

### Node 2: RSS 뉴스 가져오기 (HTTP Request)

**추가 방법**: `+` 클릭 → "HTTP Request" 검색 → 선택

| 설정 항목 | 값 |
|-----------|-----|
| Method | `GET` |
| URL | `https://feeds.reuters.com/reuters/businessNews` |
| Response Format | `Auto-detect` |

---

### Node 3: 뉴스 정리하기 (Code)

**추가 방법**: `+` 클릭 → "Code" 검색 → 선택

```javascript
// 뉴스 아이템 최대 3개 추출
const items = $input.all();
const newsItems = [];

for (let i = 0; i < Math.min(3, items.length); i++) {
  const item = items[i].json;
  newsItems.push({
    title: item.title || '',
    summary: item.contentSnippet || item.description || '',
    url: item.link || '',
    published: item.pubDate || ''
  });
}

return [{
  json: {
    news: newsItems,
    post_type: 'morning',  // ← 워크플로우마다 변경: morning / afternoon / evening
    count: newsItems.length
  }
}];
```

> 💡 워크플로우마다 `post_type` 값을 바꿔주세요:
> - `01-morning-briefing` → `'morning'`
> - `02-afternoon-analysis` → `'afternoon'`
> - `03-evening-recap` → `'evening'`

---

### Node 4: Claude AI 포스트 작성 (HTTP Request)

**추가 방법**: `+` 클릭 → "HTTP Request" 검색 → 선택

| 설정 항목 | 값 |
|-----------|-----|
| Method | `POST` |
| URL | `https://api.anthropic.com/v1/messages` |

**Headers** (+ Add Header로 하나씩 추가):

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `x-api-key` | `sk-ant-xxxxx` ← 실제 Claude API 키 |
| `anthropic-version` | `2023-06-01` |

**Body** (JSON 선택 후 아래 내용 입력):

```json
{
  "model": "claude-haiku-4-5-20251001",
  "max_tokens": 2000,
  "system": "당신은 한국 개인 투자자를 위한 미국 주식 시장 분석 전문가입니다. 요청된 뉴스를 바탕으로 SEO에 최적화된 한국어 블로그 포스트를 작성합니다. 반드시 JSON 형식으로만 응답하세요.",
  "messages": [
    {
      "role": "user",
      "content": "={{ '다음 미국 금융 뉴스를 분석하여 한국 투자자를 위한 블로그 포스트를 작성해주세요.\n\n뉴스: ' + JSON.stringify($json.news) + '\n\n반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이 JSON만):\n{\n  \"title\": \"제목 (40-60자)\",\n  \"slug\": \"url-friendly-slug\",\n  \"excerpt\": \"요약 (100-150자)\",\n  \"content_md\": \"마크다운 본문 (500자 이상)\",\n  \"tags\": [\"태그1\", \"태그2\", \"태그3\"],\n  \"category_slug\": \"시장동향\"\n}' }}"
    }
  ]
}
```

---

### Node 5: AI 응답 파싱 (Code)

```javascript
// Claude 응답에서 JSON 추출
const responseText = $input.first().json.content[0].text;

// JSON 블록 추출
const jsonMatch = responseText.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  throw new Error('Claude가 JSON 형식으로 응답하지 않았습니다: ' + responseText.substring(0, 200));
}

const post = JSON.parse(jsonMatch[0]);

// 필수 필드 확인
if (!post.title || !post.slug || !post.content_md) {
  throw new Error('필수 필드 누락: ' + JSON.stringify(Object.keys(post)));
}

return [{ json: post }];
```

---

### Node 6: 포스트 발행 (HTTP Request)

| 설정 항목 | 값 |
|-----------|-----|
| Method | `POST` |
| URL | `https://api.bigtrust.site/api/posts/internal/publish` |

**Headers**:

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `X-N8N-Secret` | `[Railway의 N8N_SECRET_KEY 값]` |

**Body** (JSON):

```json
{
  "title": "={{ $json.title }}",
  "slug": "={{ $json.slug }}",
  "excerpt": "={{ $json.excerpt }}",
  "content_md": "={{ $json.content_md }}",
  "category_slug": "={{ $json.category_slug }}",
  "tags": "={{ $json.tags }}",
  "is_ai_generated": true
}
```

---

### Node 7: 페이지 캐시 갱신 (HTTP Request)

새 포스트가 발행되면 Vercel 캐시를 갱신해야 사이트에 바로 반영됩니다.

| 설정 항목 | 값 |
|-----------|-----|
| Method | `POST` |
| URL | `https://bigtrust.site/api/revalidate` |

**Headers**:

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `x-revalidate-secret` | `[Railway의 REVALIDATE_SECRET 값]` |

**Body** (JSON):

```json
{
  "paths": ["/", "/stock-analysis"]
}
```

---

### Node 8: Discord 알림 (선택사항)

포스트가 발행되면 Discord로 알림을 받을 수 있습니다.

| 설정 항목 | 값 |
|-----------|-----|
| Method | `POST` |
| URL | `Discord 웹훅 URL` |

**Body** (JSON):

```json
{
  "content": "✅ 새 포스트 발행!\n**{{ $json.title }}**\nhttps://bigtrust.site/post/{{ $json.slug }}"
}
```

> 💡 Discord 웹훅 URL 만들기: Discord 서버 → 채널 설정 → 연동 → 웹훅 → 새 웹훅

---

## STEP 5: 테스트 실행

워크플로우 구성이 완료되면 **테스트를 먼저** 해보세요.

1. 워크플로우 열기
2. Schedule Trigger 노드 클릭 → **"Listen For Test Event"** 클릭
3. 상단 **"Test workflow"** 버튼 클릭
4. 각 노드가 초록색(✅)이면 성공!
5. 빨간색(❌)이면 해당 노드 클릭 → 에러 메시지 확인

**테스트 성공 후:**
- [https://bigtrust.site](https://bigtrust.site) 접속 → 새 포스트 확인

---

## STEP 6: 자동 실행 활성화

테스트 성공 후 자동 실행을 켭니다.

1. 워크플로우 화면 우상단 **"Inactive"** 토글 클릭
2. **"Active"** 로 변경 확인
3. 3개 워크플로우 모두 동일하게 활성화

---

## 📋 최종 체크리스트

- [ ] Railway 환경 변수 7개 설정 완료
- [ ] n8n 계정 생성
- [ ] Anthropic Credential 추가
- [ ] `01-morning-briefing` 워크플로우 생성 및 테스트
- [ ] `02-afternoon-analysis` 워크플로우 생성 및 테스트
- [ ] `03-evening-recap` 워크플로우 생성 및 테스트
- [ ] 3개 워크플로우 모두 **Active** 상태 확인
- [ ] bigtrust.site에서 포스트 발행 확인

---

## 🆘 자주 발생하는 문제

| 증상 | 원인 | 해결 방법 |
|------|------|-----------|
| Node 6 에러 (401) | N8N_SECRET_KEY 불일치 | Railway와 n8n의 값이 동일한지 확인 |
| Node 6 에러 (500) | 데이터베이스 연결 실패 | Railway MySQL 플러그인 추가 확인 |
| Node 4 에러 | Claude API 키 오류 | Anthropic 키 재확인 |
| Node 7 에러 | REVALIDATE_SECRET 불일치 | Railway와 n8n의 값이 동일한지 확인 |
| 포스트 발행은 됐는데 사이트에 안 보임 | ISR 캐시 미갱신 | Node 7 정상 실행 확인 |
