# n8n Cloud 워크플로우 설정 상세 가이드

## 📋 목차
1. [n8n Cloud 계정 설정](#계정-설정)
2. [Credentials 설정](#credentials-설정)
3. [워크플로우 3개 생성](#워크플로우-생성)
4. [각 노드 상세 설정](#노드-설정)
5. [테스트 및 배포](#테스트-및-배포)
6. [문제 해결](#문제-해결)

---

## 계정 설정

### Step 1: 계정 생성
1. https://n8n.io → **"Get Started"** 클릭
2. Email 또는 GitHub으로 계정 생성
3. 무료 플랜 선택
4. 대시보드에 접속

### Step 2: 환경 변수 설정
1. 좌측 메뉴 → **Settings** 클릭
2. **Variables** 탭
3. 다음 변수들을 추가:

| 변수명 | 값 | 설명 |
|---|---|---|
| `N8N_SECRET_KEY` | Railway에서 설정한 값 | 내부 API 인증 |
| `REVALIDATE_SECRET` | Railway에서 설정한 값 | ISR 재검증 비밀키 |
| `ANTHROPIC_API_KEY` | sk-ant-xxxxx | Claude API 키 |
| `BACKEND_URL` | https://api.usstockstory.com | Backend API URL |
| `FRONTEND_URL` | https://usstockstory.com | Frontend URL |
| `DISCORD_WEBHOOK_URL` | https://discord.com/api/webhooks/... | Discord 알림 (선택) |

**추가 방법:**
```
변수명 입력 → "+" 클릭 → 값 입력 → Save
```

---

## Credentials 설정

### Step 1: Anthropic API 추가

1. 좌측 메뉴 → **Credentials**
2. **"+ New Credential"** 버튼
3. **Anthropic** 검색 후 선택
4. 다음 정보 입력:
   - **Credential Name:** `Anthropic API`
   - **API Key:** `sk-ant-xxxxx` (Claude API 키)
5. **Save** 클릭

이제 HTTP Request 노드에서 "Anthropic API" credential을 선택할 수 있습니다.

---

## 워크플로우 생성

### 기본 구조

모든 워크플로우는 다음과 같은 순서를 따릅니다:

```
1. Schedule Trigger (정해진 시간에 자동 실행)
   ↓
2. Create AI Log (기록 시작)
   ↓
3. Fetch RSS News (뉴스 수집)
   ↓
4. Parse News (XML 파싱)
   ↓
5. Call Claude API (AI 분석)
   ↓
6. Parse Response (JSON 추출)
   ↓
7. Publish Post (포스트 발행)
   ↓
8. Trigger ISR (프론트 갱신)
   ↓
9. Discord Notification (선택)
   ↓
10. Update AI Log (완료 기록)
```

### 워크플로우 1: 01-morning-briefing

**목적:** 매일 아침 8시에 미국 프리마켓 뉴스 요약 발행

#### 1-1. 워크플로우 생성
```
Dashboard → "+ New" → "Workflow"
```

#### 1-2. Schedule Trigger 설정
1. 우측 패널에서 **Add Node** 클릭
2. **Trigger** 섹션에서 **Schedule** 선택
3. 설정:
   - **Trigger type:** Cron
   - **Cron Expression:** `0 23 * * *` (매일 UTC 23:00 = KST 08:00)
   - Save

#### 1-3. HTTP Request Node (AI Log 생성)
1. **Add Node** → **HTTP Request**
2. 설정:
   ```
   Method: POST
   URL: {{ $env.BACKEND_URL }}/api/ai-logs/internal/create
   Authentication: None
   Headers:
     x-n8n-secret: {{ $env.N8N_SECRET_KEY }}
     Content-Type: application/json
   Body (JSON):
     {
       "trigger_type": "morning",
       "model": "claude-haiku-4-5",
       "prompt_tokens": 0,
       "completion_tokens": 0,
       "total_tokens": 0,
       "cost": 0,
       "status": "in_progress",
       "error_message": null
     }
   ```
3. Connect: Schedule → HTTP Request

#### 1-4. HTTP Request Node (RSS 뉴스 수집)
1. **Add Node** → **HTTP Request**
2. 설정:
   ```
   Method: GET
   URL: https://feeds.reuters.com/business/news
   Response Format: String
   ```
3. Connect: Create AI Log → HTTP Request (RSS)

**참고:** 다른 RSS 소스:
- Yahoo Finance: `https://feeds.finance.yahoo.com/rss/2.0/headline`
- Bloomberg: `https://www.bloomberg.com/feed/podcast/etf-report.xml`

#### 1-5. Function Node (뉴스 파싱)
1. **Add Node** → **Function**
2. 함수 코드:
   ```javascript
   // XML 문자열을 파싱하여 최신 5개 뉴스 추출
   const rssXml = $node["HTTP Request (RSS)"].json.body;
   
   // Simple parsing (정규식 사용)
   const titleRegex = /<title>(.*?)<\/title>/g;
   const descriptionRegex = /<description>(.*?)<\/description>/g;
   const linkRegex = /<link>(.*?)<\/link>/g;
   
   let titles = [];
   let match;
   while ((match = titleRegex.exec(rssXml)) !== null) {
     titles.push(match[1]);
   }
   
   // 최신 5개만 반환
   return { headlines: titles.slice(0, 5).join('\n') };
   ```
3. Connect: HTTP Request (RSS) → Function

#### 1-6. HTTP Request Node (Claude API 호출)
1. **Add Node** → **HTTP Request**
2. 설정:
   ```
   Method: POST
   URL: https://api.anthropic.com/v1/messages
   Authentication: Anthropic API (credentials 선택)
   Headers:
     Content-Type: application/json
   Body (JSON):
     {
       "model": "claude-haiku-4-5-20251001",
       "max_tokens": 2000,
       "system": "당신은 미국 주식 시장 전문 기자입니다. 한국 투자자 관점에서 작성합니다. 블로그 포스트 형식으로 제목, 설명, 마크다운 컨텐츠를 JSON으로 반환하세요: {\"title\": \"...\", \"slug\": \"...\", \"content_md\": \"...\"}",
       "messages": [
         {
           "role": "user",
           "content": "이 뉴스들을 바탕으로 미국 프리마켓 브리핑을 작성해주세요:\n\n{{ $node.step_5.json.headlines }}"
         }
       ]
     }
   ```
3. Connect: Function → HTTP Request (Claude)

#### 1-7. Function Node (응답 파싱)
1. **Add Node** → **Function**
2. 함수 코드:
   ```javascript
   const response = $node["HTTP Request (Claude)"].json.content[0].text;
   
   try {
     // JSON 추출 시도
     const jsonMatch = response.match(/\{[\s\S]*\}/);
     if (jsonMatch) {
       return JSON.parse(jsonMatch[0]);
     }
   } catch (e) {
     // Fallback
   }
   
   // Fallback: 수동 파싱
   return {
     title: "모닝 브리핑 - " + new Date().toISOString().split('T')[0],
     slug: "morning-briefing-" + new Date().toISOString().split('T')[0],
     content_md: response
   };
   ```
3. Connect: HTTP Request (Claude) → Function

#### 1-8. HTTP Request Node (포스트 발행)
1. **Add Node** → **HTTP Request**
2. 설정:
   ```
   Method: POST
   URL: {{ $env.BACKEND_URL }}/api/posts/internal/publish
   Headers:
     x-n8n-secret: {{ $env.N8N_SECRET_KEY }}
     Content-Type: application/json
   Body (JSON):
     {
       "title": "{{ $node.step_7.json.title }}",
       "slug": "{{ $node.step_7.json.slug }}",
       "content": "{{ $node.step_7.json.content_md }}",
       "category_id": 1,
       "tags": ["시장", "브리핑"],
       "is_published": true,
       "excerpt": "오늘의 미국 프리마켓 브리핑"
     }
   ```
3. Connect: Function → HTTP Request (Publish)

#### 1-9. HTTP Request Node (ISR 재검증)
1. **Add Node** → **HTTP Request**
2. 설정:
   ```
   Method: POST
   URL: {{ $env.FRONTEND_URL }}/api/revalidate
   Headers:
     x-revalidate-secret: {{ $env.REVALIDATE_SECRET }}
     Content-Type: application/json
   Body (JSON):
     {
       "slug": "{{ $node.step_7.json.slug }}"
     }
   ```
3. Connect: HTTP Request (Publish) → HTTP Request (ISR)

#### 1-10. HTTP Request Node (Discord 알림, 선택)
1. **Add Node** → **HTTP Request**
2. 설정:
   ```
   Method: POST
   URL: {{ $env.DISCORD_WEBHOOK_URL }}
   Body (JSON):
     {
       "content": "✅ **모닝 브리핑 발행됨**\n📝 {{ $node.step_7.json.title }}\n🔗 {{ $env.FRONTEND_URL }}/post/{{ $node.step_7.json.slug }}"
     }
   ```
3. Connect: ISR → Discord (선택사항)

#### 1-11. HTTP Request Node (AI Log 업데이트)
1. **Add Node** → **HTTP Request**
2. 설정:
   ```
   Method: PUT
   URL: {{ $env.BACKEND_URL }}/api/ai-logs/internal/{{ $node.step_2.json.id }}
   Headers:
     x-n8n-secret: {{ $env.N8N_SECRET_KEY }}
     Content-Type: application/json
   Body (JSON):
     {
       "status": "completed",
       "prompt_tokens": 150,
       "completion_tokens": 500,
       "total_tokens": 650,
       "cost": 0.00078
     }
   ```
3. Connect: Discord → Update AI Log (또는 ISR → Update AI Log)

#### 1-12. 워크플로우 저장 및 활성화
1. 좌측 상단 워크플로우 이름 클릭
2. **"01-morning-briefing"** 입력
3. **Save** 클릭
4. **Activate** 클릭

---

### 워크플로우 2: 02-afternoon-analysis

**목적:** 매일 오후 2시에 종목 분석

**설정 차이:**
- Cron: `0 5 * * *` (UTC 05:00 = KST 14:00)
- RSS URL: `https://feeds.seekingalpha.com/articles/index.xml` (또는 MarketWatch)
- Trigger Type: `afternoon`
- 프롬프트: "오늘 주목할 미국 주식 종목을 기술적 분석과 함께 설명해주세요"

**나머지는 01-morning-briefing과 동일합니다.**

---

### 워크플로우 3: 03-evening-recap

**목적:** 매일 오후 10시에 장 마감 리캡

**설정 차이:**
- Cron: `0 13 * * *` (UTC 13:00 = KST 22:00)
- RSS URL: `https://feeds.apnews.com/apf/BusinessTopics` (또는 Reuters Markets)
- Trigger Type: `evening`
- 프롬프트: "미국 증시 마감을 한국 투자자의 관점에서 요약해주세요"

**나머지는 01-morning-briefing과 동일합니다.**

---

## 테스트 및 배포

### Step 1: 수동 테스트
1. 워크플로우 열기
2. **Execute Workflow** 버튼 클릭
3. Executions 탭에서 로그 확인
   - ✅ 모든 노드가 초록색 = 성공
   - ❌ 빨간색 노드 = 에러 (로그 확인)

### Step 2: 포스트 확인
- Frontend (https://usstockstory.com) 새로고침
- 최신 포스트 표시 확인

### Step 3: 자동 실행 활성화
1. Workflow 이름 옆 **Activate** 버튼
2. Status: **"Active"** 확인
3. 매일 정해진 시간에 자동 실행 시작

---

## 문제 해결

### 에러: "Unauthorized"
- **확인:** 환경 변수 `N8N_SECRET_KEY` 값이 Railway와 동일한지 확인
- **Rails:** Railway → Settings → Variables에서 값 복사

### 에러: "JSON.parse 실패"
- **원인:** Claude API 응답이 JSON 형식이 아님
- **해결:** Function 노드의 fallback 로직 확인

### 포스트가 발행되지 않음
- **확인 1:** Backend API 상태: `curl https://api.usstockstory.com/api`
- **확인 2:** n8n 실행 로그에서 "Publish Post" 노드 상태 확인
- **확인 3:** 포스트 카테고리 ID가 올바른지 확인 (기본: 1)

### Discord 알림이 도착하지 않음
- **확인:** Discord Webhook URL이 정확한지 확인
- **생성:** Discord 서버 → Channel Settings → Integrations → Webhooks

---

## 🎯 체크리스트

- [ ] n8n Cloud 계정 생성
- [ ] 환경 변수 6개 추가
- [ ] Anthropic Credentials 추가
- [ ] 워크플로우 01-morning-briefing 생성
- [ ] 워크플로우 02-afternoon-analysis 생성
- [ ] 워크플로우 03-evening-recap 생성
- [ ] 3개 워크플로우 수동 테스트 성공
- [ ] 3개 워크플로우 자동 실행 활성화
- [ ] Discord 알림 작동 확인 (선택)

**총 소요 시간: 15-20분**
