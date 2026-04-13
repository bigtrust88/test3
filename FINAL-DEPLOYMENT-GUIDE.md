# 🚀 Week 3: 최종 배포 완전 가이드

**현재 상황:**
- ✅ Vercel (Frontend): 배포 완료 (https://frontend-4igrzken4-bigtrust88s-projects.vercel.app)
- ✅ GitHub: 코드 푸시 완료 (https://github.com/bigtrust88/test3)
- ⏳ Railway (Backend): 웹 UI 설정 필요 (5분)
- ⏳ n8n Cloud: 워크플로우 설정 필요 (10분)

---

## Phase 1: Railway 배포 (5분)

### 1-1. Railway 프로젝트 생성

1. [railway.app](https://railway.app) 접속
2. 우상단 **"New Project"** 클릭
3. **"Deploy from GitHub"** 선택
4. GitHub 저장소: **`bigtrust88/test3`** 선택
5. Branch: **`main`** 선택 (자동 감지)
6. **Deploy** 클릭

**예상 시간:** 1분

### 1-2. MySQL 플러그인 추가

배포 중인 상태에서:

1. Dashboard → **"+ Add"** 클릭
2. **Marketplace** 탭에서 **MySQL** 검색
3. **Add Plugin** 클릭
4. MySQL 플러그인 생성 확인
5. **Variables** 탭에서 자동 생성된 `DATABASE_URL` 확인

**예상 시간:** 1분

### 1-3. 환경 변수 설정

Project Settings → **Variables** 탭에서 다음을 추가:

```
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long-here
JWT_EXPIRATION=7d
N8N_SECRET_KEY=your-n8n-shared-secret-key-at-least-32-chars
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=https://usstockstory.com
REVALIDATE_SECRET=your-revalidate-secret-key-for-isr-validation
BANNERBEAR_API_KEY=optional-for-future-features
```

**주의:** 실제 값으로 수정하세요. `JWT_SECRET`, `N8N_SECRET_KEY`, `REVALIDATE_SECRET`는 **최소 32글자**의 무작위 문자열입니다.

**예상 시간:** 2분

### 1-4. 배포 확인

1. **Deployments** 탭에서 배포 상태 확인
2. Status가 "Success" (녹색)가 될 때까지 대기 (보통 2-3분)
3. **Logs** 탭에서 다음 메시지 확인:
   ```
   ✅ Application is running on port 3001
   ```

4. 터미널에서 배포 확인:
   ```bash
   curl https://[railway-url]/api
   # 응답: {"message":"Hello World!"}
   ```

**예상 시간:** 2-3분

---

## Phase 2: Vercel 배포 (완료됨)

✅ 이미 배포되었습니다.

**배포 URL:** https://frontend-4igrzken4-bigtrust88s-projects.vercel.app

---

## Phase 3: n8n Cloud 워크플로우 설정 (10분)

### 3-1. n8n Cloud 계정 생성

1. [n8n.io](https://n8n.io) 접속
2. **"Get Started"** 클릭
3. Email/Password로 계정 생성 또는 GitHub 로그인
4. 무료 플랜 선택

**예상 시간:** 2분

### 3-2. Credentials 설정

#### Anthropic API 추가

1. 좌측 메뉴 → **Credentials**
2. **"+ New"** 클릭
3. **"Anthropic"** 검색 후 선택
4. **Credential Name:** `Anthropic API`
5. **API Key:** `sk-ant-xxxxx` (Claude API 키)
6. **Save** 클릭

#### Environment Variables 추가

1. **Settings** → **Variables**
2. 다음을 추가:

```
N8N_SECRET_KEY=your-n8n-secret-from-railway
REVALIDATE_SECRET=your-revalidate-secret-from-railway
ANTHROPIC_API_KEY=sk-ant-xxxxx
BACKEND_URL=https://api.usstockstory.com
FRONTEND_URL=https://usstockstory.com
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxxx/xxxxx (선택)
```

**예상 시간:** 2분

### 3-3. 워크플로우 생성 (3개)

각 워크플로우는 **동일한 구조**를 가집니다:

#### 공통 구조

```
[Schedule Trigger] 
  ↓ (Cron 시간대별)
[Create AI Log] 
  ↓ POST /api/ai-logs/internal/create
[Fetch RSS News] 
  ↓ HTTP Request
[Parse News] 
  ↓ XML 파싱
[Call Claude API] 
  ↓ Anthropic API
[Parse Response] 
  ↓ JSON 추출
[Publish Post] 
  ↓ POST /api/posts/internal/publish
[Revalidate ISR] 
  ↓ POST /api/revalidate
[Discord Notification] 
  ↓ Webhook
[Update AI Log] 
  ↓ PUT /api/ai-logs/internal/:id
```

#### 워크플로우 1: 01-morning-briefing

- **이름:** `01-morning-briefing`
- **시간:** 매일 **08:00 KST** (UTC 23:00)
- **Cron:** `0 23 * * *`
- **유형:** `morning`
- **RSS URL:** https://feeds.reuters.com/business/news (또는 Yahoo Finance)
- **프롬프트:** "미국 프리마켓 주식 시장의 오늘 주요 뉴스를 한국 투자자 관점에서 분석해주세요"

**수동 설정 방법:**

1. Dashboard → **+ New** → **Workflow**
2. **Schedule Trigger** 추가
   - Trigger Type: **Cron**
   - Cron Expression: `0 23 * * *`
3. **HTTP Request** 노드 추가 (AI Log 생성)
   - Method: `POST`
   - URL: `https://api.usstockstory.com/api/ai-logs/internal/create`
   - Headers: `x-n8n-secret: {{ $env.N8N_SECRET_KEY }}`
   - Body (JSON):
     ```json
     {
       "trigger_type": "morning",
       "model": "claude-haiku-4-5",
       "status": "in_progress"
     }
     ```
4. **HTTP Request** 노드 추가 (RSS 크롤링)
   - URL: `https://feeds.reuters.com/business/news`
5. **Function** 노드 추가 (뉴스 파싱)
6. **HTTP Request** 노드 추가 (Claude API)
   - URL: `https://api.anthropic.com/v1/messages`
   - 인증: Anthropic Credentials
7. **Function** 노드 (JSON 응답 파싱)
8. **HTTP Request** 노드 (포스트 발행)
   - URL: `https://api.usstockstory.com/api/posts/internal/publish`
9. **HTTP Request** 노드 (ISR 재검증)
   - URL: `https://usstockstory.com/api/revalidate`
10. **HTTP Request** 노드 (Discord 알림, 선택)
11. **HTTP Request** 노드 (AI Log 업데이트)

#### 워크플로우 2: 02-afternoon-analysis

- **이름:** `02-afternoon-analysis`
- **시간:** 매일 **14:00 KST** (UTC 05:00)
- **Cron:** `0 5 * * *`
- **유형:** `afternoon`
- **RSS URL:** https://feeds.seekingalpha.com/articles (또는 MarketWatch)
- **프롬프트:** "오늘 주목할 미국 주식 종목을 기술적 분석과 함께 설명해주세요"

#### 워크플로우 3: 03-evening-recap

- **이름:** `03-evening-recap`
- **시간:** 매일 **22:00 KST** (UTC 13:00)
- **Cron:** `0 13 * * *`
- **유형:** `evening`
- **RSS URL:** https://feeds.apnews.com/apf/BusinessTopics (또는 Reuters Markets)
- **프롬프트:** "미국 증시 마감을 한국 투자자의 관점에서 요약해주세요"

**예상 시간:** 3분 × 3 = 9분

### 3-4. 테스트 실행

각 워크플로우마다:

1. 워크플로우 열기
2. **"Execute Workflow"** (또는 수동 실행)
3. 포스트가 발행되는지 확인:
   - https://frontend-4igrzken4-bigtrust88s-projects.vercel.app 새로고침
   - 또는 Discord 채널에서 알림 확인

**예상 시간:** 1분

### 3-5. 자동 실행 활성화

각 워크플로우마다:

1. 좌측 상단 **"Activate"** 버튼 클릭
2. Status: **"Active"** 확인
3. Schedule이 설정되어 자동 실행 시작

**예상 시간:** 1분

---

## Phase 4: 통합 테스트

### 4-1. Backend API 테스트

```bash
# Health check
curl https://api.usstockstory.com/api
# 응답: {"message":"Hello World!"}

# Swagger 문서 (개발 모드만)
curl https://api.usstockstory.com/api/docs
```

### 4-2. Frontend 테스트

1. https://usstockstory.com (또는 vercel.app URL) 접속
2. 홈 페이지 로드 확인
3. 최신 포스트 표시 확인
4. 카테고리 페이지 접속 확인
5. 다크모드 토글 작동 확인

### 4-3. ISR 재검증 테스트

```bash
curl -X POST https://usstockstory.com/api/revalidate \
  -H "x-revalidate-secret: [REVALIDATE_SECRET]" \
  -H "Content-Type: application/json" \
  -d '{"slug": "test-post"}'

# 응답: {"revalidated": true}
```

### 4-4. n8n 워크플로우 테스트

1. n8n Cloud에서 각 워크플로우 열기
2. **Execute Workflow** 클릭
3. 로그 확인:
   - ✅ 모든 노드가 성공하면 초록색
   - ❌ 에러가 있으면 빨간색 (로그 확인)

### 4-5. Discord 알림 테스트 (선택)

- n8n 워크플로우 실행 시 Discord 채널에 알림 도착 확인

---

## 📋 환경 변수 체크리스트

필수 값들을 준비해야 합니다:

```
항목                    예시                                    출처
============================================================
JWT_SECRET             jhdf9s@#$%^&*()sd9f0sdf9...            무작위 생성
N8N_SECRET_KEY         aksldk@#$%^asdfjsdf9asd...             무작위 생성
REVALIDATE_SECRET      xczv123@#$%^&asdfsdfxcv...             무작위 생성
ANTHROPIC_API_KEY      sk-ant-v0-...                          Claude API
DISCORD_WEBHOOK_URL    https://discord.com/api/webhooks/...   Discord (선택)
FRONTEND_URL           https://usstockstory.com               도메인
BACKEND_URL            https://api.usstockstory.com           Railway URL
BANNERBEAR_API_KEY     (선택)                                 미래용
```

---

## 🎯 최종 체크리스트

- [ ] Railway 프로젝트 생성 및 GitHub 연동
- [ ] MySQL 플러그인 추가
- [ ] Railway 환경 변수 설정 (8개)
- [ ] Railway 배포 성공 (Status: Success)
- [ ] n8n Cloud 계정 생성
- [ ] n8n Anthropic Credentials 추가
- [ ] n8n Environment Variables 설정
- [ ] n8n 워크플로우 3개 생성
  - [ ] 01-morning-briefing (08:00 KST)
  - [ ] 02-afternoon-analysis (14:00 KST)
  - [ ] 03-evening-recap (22:00 KST)
- [ ] 각 워크플로우 테스트 실행 성공
- [ ] n8n 워크플로우 자동 실행 활성화
- [ ] Frontend 페이지 로드 확인
- [ ] Backend API 응답 확인
- [ ] ISR 재검증 API 작동 확인
- [ ] Discord 알림 도착 확인 (선택)

**총 예상 시간: 15분**

---

## 🔧 문제 해결

### Railway 배포 실패
- **확인:** Logs 탭에서 에러 메시지 확인
- **MySQL:** `DATABASE_URL` 환경 변수 자동 생성되었는지 확인
- **환경 변수:** 모든 필수 변수가 설정되었는지 확인
- **빌드:** npm install과 npm run build가 성공하는지 확인

### n8n 워크플로우 에러
- **로그:** Executions 탭에서 상세 에러 확인
- **변수:** Environment Variables 설정 재확인
- **API:** 엔드포인트 URL이 정확한지 확인
- **Headers:** x-n8n-secret, x-revalidate-secret이 정확한지 확인

### Frontend 포스트 미표시
- **ISR:** revalidate API가 호출되었는지 확인
- **Backend:** 포스트가 정말로 발행되었는지 API로 확인
- **캐시:** 브라우저 캐시 삭제 후 재접속

---

## 📞 디버깅 명령어

```bash
# Backend 상태 확인
curl -v https://api.usstockstory.com/api

# Frontend 상태 확인
curl -v https://usstockstory.com

# n8n 워크플로우 로그 확인
# → n8n Cloud UI의 Executions 탭

# Railway 로그 확인
# → Railway Dashboard의 Logs 탭
```

---

## 🎉 배포 완료!

모든 단계가 완료되면:

1. ✅ Backend: Railway에서 실행 중
2. ✅ Frontend: Vercel에서 실행 중
3. ✅ Automation: n8n에서 자동 실행 중
4. ✅ Database: MySQL에 데이터 저장 중
5. ✅ Notifications: Discord로 알림 발송 중

**다음 단계 (선택):**
- 실제 도메인 구매 (Cloudflare DNS 설정)
- Google Search Console 등록
- AdSense 계정 연동
- 성능 모니터링 (Sentry, New Relic)
