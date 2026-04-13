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
5. **Variables** 탭에서 자동 생성된 `MYSQL_URL` 확인

mysql://root:ZKmOsBwhWVgYHTiVAGaPNtwLQaenSjMt@mysql.railway.internal:3306/railway

**예상 시간:** 1분

### 1-3. 환경 변수 설정

#### Step 1: Project Settings 접근

1. **Railway Dashboard** 접속 (https://railway.app)
2. 좌측 메뉴에서 방금 생성한 프로젝트 클릭
3. 우상단의 **Project** 탭 클릭
4. 드롭다운에서 **Settings** 선택 (또는 좌측 메뉴 하단의 **Settings** 클릭)

#### Step 2: Variables 탭 찾기

1. Settings 페이지에서 여러 탭이 보입니다:
   - General
   - **Variables** ← 이곳 클릭
   - Integrations
   - 등등
2. **Variables** 탭 클릭

#### Step 3: 환경 변수 추가하기 (개별 입력 방식)

Variables 탭에 들어가면 두 가지 방식이 있습니다:

**방식 A: 수동으로 각 변수 입력하기 (권장)**

1. **"+ New Variable"** 또는 **"Add"** 버튼 클릭
2. 다음과 같은 입력창이 나타남:
   ```
   [KEY 입력창]     [VALUE 입력창]     [추가 버튼]
   ```
3. 각 변수를 하나씩 추가:

**변수 1: NODE_ENV**
- KEY: `NODE_ENV`
- VALUE: `production`
- ✓ 저장

**변수 2: PORT**
- KEY: `PORT`
- VALUE: `3001`
- ✓ 저장

**변수 3: LOG_LEVEL**
- KEY: `LOG_LEVEL`
- VALUE: `info`
- ✓ 저장

**변수 4: JWT_SECRET** ⭐ 중요
- KEY: `JWT_SECRET`
- VALUE: `(최소 32글자의 무작위 문자열)`
  - 예: `jF9@mK2$xL5#qW8&pR3*vN7!sH4^dG6tJ`
- ✓ 저장

**변수 5: JWT_EXPIRATION**
- KEY: `JWT_EXPIRATION`
- VALUE: `7d`
- ✓ 저장

**변수 6: N8N_SECRET_KEY** ⭐ 중요
- KEY: `N8N_SECRET_KEY`
- VALUE: `(최소 32글자의 무작위 문자열)`
  - 예: `aB1@cD2#eF3$gH4%iJ5^kL6&mN7*oP8qR`
- ✓ 저장

**변수 7: ANTHROPIC_API_KEY** ⭐ 중요
- KEY: `ANTHROPIC_API_KEY`
- VALUE: `sk-ant-xxxxxxxxxxxxxxxxxxxxx` (실제 Claude API 키)
- ✓ 저장

**변수 8: FRONTEND_URL**
- KEY: `FRONTEND_URL`
- VALUE: `https://bigtrust.site` (또는 Vercel URL)
- ✓ 저장

**변수 9: REVALIDATE_SECRET** ⭐ 중요
- KEY: `REVALIDATE_SECRET`
- VALUE: `(최소 32글자의 무작위 문자열)`
  - 예: `xC9@vB2#nZ5$mX8%kL3^qW6&jH4*pO7sA`
- ✓ 저장

**변수 10: BANNERBEAR_API_KEY** (선택 - 미래용)
- KEY: `BANNERBEAR_API_KEY`
- VALUE: (나중에 설정 가능, 일단 생략 가능)
- ✓ 저장

#### Step 4: MYSQL_URL 확인하기

MySQL 플러그인을 추가했다면, 자동으로 생성된 환경 변수들이 있습니다:

1. **Variables** 탭을 스크롤 하면 이미 있는 변수들:
   - `MYSQL_URL` ← 자동 생성됨 (건드리지 말기!)
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`

2. 이들은 이미 설정되어 있으므로 **수정하지 마세요**

#### Step 5: 저장 완료 확인

1. 모든 변수를 추가한 후
2. 페이지 하단의 **"Save"** 또는 **"Apply"** 버튼 클릭
3. 초록색 체크 표시 또는 **"Environment variables updated successfully"** 메시지 확인

**주의 사항:**
- ⭐ `JWT_SECRET`, `N8N_SECRET_KEY`, `REVALIDATE_SECRET`는 **최소 32글자의 무작위 문자열**이어야 합니다
- 이 값들을 **반드시 메모해두세요** (n8n 설정에서 동일한 값 필요)
- 공백이나 특수문자가 포함될 수 있으니 복사-붙여넣기 할 때 주의
- 변수명(KEY)에 공백이 없어야 합니다

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

> ⚠️ **주의:** n8n Cloud **Free 플랜을 사용하는 경우** 환경변수(Variables) 기능이 제한됩니다.
> 본 가이드의 **`{{ $env... }}`를 직접 값으로 대체**하여 입력하세요. (더 자세한 내용은 3-2 참고)

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

#### ⚠️ n8n Cloud Free 플랜 제한사항

**Settings → Variables는 n8n Cloud Free 플랜에서 사용 불가**합니다.

대신 다음 값들을 **워크플로우 생성 시 직접 입력**하세요:

- **BACKEND_URL:** `https://api.bigtrust.site`
- **FRONTEND_URL:** `https://bigtrust.site`
- **REVALIDATE_SECRET:** Railway 환경변수에서 복사
- **DISCORD_WEBHOOK_URL:** (선택) Discord 웹훅 URL

> **Anthropic API Key는** 이미 위의 Credentials에서 추가했으므로 추가 설정 불필요

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
   - URL: `https://api.bigtrust.site/api/ai-logs/internal/create`
   - Headers: `x-n8n-secret: [YOUR_N8N_SECRET_KEY]` ⚠️ Free 플랜이므로 직접 입력
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
   - URL: `https://api.bigtrust.site/api/posts/internal/publish`
9. **HTTP Request** 노드 (ISR 재검증)
   - Method: `POST`
   - URL: `https://bigtrust.site/api/revalidate`
   - Headers: `x-revalidate-secret: [YOUR_REVALIDATE_SECRET]` ⚠️ Free 플랜이므로 직접 입력
   - Body: `{"paths": ["/", "/news"]}`
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
curl https://api.bigtrust.site/api
# 응답: {"message":"Hello World!"}

# Swagger 문서 (개발 모드만)
curl https://api.bigtrust.site/api/docs
```

### 4-2. Frontend 테스트

1. https://bigtrust.site (또는 vercel.app URL) 접속
2. 홈 페이지 로드 확인
3. 최신 포스트 표시 확인
4. 카테고리 페이지 접속 확인
5. 다크모드 토글 작동 확인

### 4-3. ISR 재검증 테스트

```bash
curl -X POST https://bigtrust.site/api/revalidate \
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
FRONTEND_URL           https://bigtrust.site               도메인
BACKEND_URL            https://api.bigtrust.site           Railway URL
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
curl -v https://api.bigtrust.site/api

# Frontend 상태 확인
curl -v https://bigtrust.site

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

---

## 🌐 Part 5: 새로운 도메인 구매 및 설정

bigtrust.site이 이미 사용 중인 경우, 새로운 도메인을 구매하고 설정하는 방법입니다.

### 5-1. 도메인 등록사 선택 및 구매

#### 추천 도메인 등록사 (비교)

| 등록사 | 장점 | 단점 | DNS 관리 |
|--------|------|------|---------|
| **Namecheap** | 저렴, 한글 지원 | - | 우수 |
| **Google Domains** | 간단한 UI, Google 통합 | 가격 높음 | 우수 |
| **Cloudflare** | 무료 DNS, 성능 우수 | 초기 설정 복잡 | 최고 |
| **GoDaddy** | 널리 알려짐 | UI 복잡, 비쌈 | 중간 |

**추천: Namecheap** (저렴 + 한글 지원) 또는 **Cloudflare** (무료 DNS + 성능)

#### Namecheap에서 도메인 구매 (추천)

1. **Namecheap** 접속: https://www.namecheap.com
2. 상단 검색창에서 원하는 도메인 검색
   - 예: `mynewstory.com`, `stockbriefing.com`, `investkr.com`
3. 원하는 도메인 선택 (연록색 "Add to Cart" 클릭)
4. **Cart** → **Checkout** 진행
5. 계정 생성/로그인
6. 결제 완료

**도메인 아이디어:**
- `stockbriefing.com` - 간단하고 명확함
- `marketdaily.kr` - 한국 도메인
- `newsbrief.io` - 현대적임
- `investingtips.com` - 명시적임

**예상 시간:** 5분

### 5-2. DNS 레코드 설정

도메인을 구매한 후, DNS 레코드를 설정해야 합니다.

#### DNS 레코드 종류

```
CNAME 레코드:
- Frontend (Vercel) 연결용
- Subdomain (www, api) 연결용

A 레코드:
- IP 주소 직접 지정 (보통 필요 없음)
```

#### Step 1: Namecheap 대시보드 접속

1. **Namecheap 로그인** (https://www.namecheap.com/myaccount/login)
2. **Domain List** 클릭
3. 방금 구매한 도메인 우측의 **Manage** 클릭

#### Step 2: DNS 설정 페이지 열기

1. **Advanced DNS** 탭 클릭
2. **Host Records** 섹션 찾기

#### Step 3: 필요한 DNS 레코드 추가

**레코드 1: Root 도메인 → Vercel Frontend**

| 항목 | 값 |
|------|-----|
| Type | CNAME Record |
| Host | @ (또는 루트) |
| Value | cname.vercel-dns.com |
| TTL | 3600 |

✓ 저장

**레코드 2: www 서브도메인 → Vercel Frontend**

| 항목 | 값 |
|------|-----|
| Type | CNAME Record |
| Host | www |
| Value | cname.vercel-dns.com |
| TTL | 3600 |

✓ 저장

**레코드 3: api 서브도메인 → Railway Backend**

| 항목 | 값 |
|------|-----|
| Type | CNAME Record |
| Host | api |
| Value | [Railway 프로젝트 도메인] |
| TTL | 3600 |

⚠️ Railway 도메인을 알아야 합니다 (아래 5-3 참고)

**예상 시간:** 2분

### 5-3. Railway에서 도메인 연결

#### Step 1: Railway 프로젝트 설정

1. **Railway Dashboard** 접속 (https://railway.app)
2. 프로젝트 선택
3. 상단 **Project** → **Settings** 클릭
4. 좌측 메뉴에서 **Domains** (또는 **Custom Domain**) 클릭

#### Step 2: 커스텀 도메인 추가

1. **"+ Add Custom Domain"** 클릭
2. 다음 중 선택:
   - **`api.mynewstory.com`** (백엔드용)
   - 또는 다른 서브도메인

3. 입력 후 **Add** 클릭

#### Step 3: DNS 레코드 확인

Railway가 다음과 같은 정보를 제공합니다:

```
CNAME Host: api.mynewstory.com
CNAME Target: [railway-provided-cname]
```

이 정보를 Namecheap의 API 레코드 (Step 3)에 입력합니다.

**예상 시간:** 2분

### 5-4. Vercel에서 도메인 연결

#### Step 1: Vercel 프로젝트 설정

1. **Vercel Dashboard** 접속 (https://vercel.com)
2. Frontend 프로젝트 선택
3. **Settings** → **Domains** 클릭

#### Step 2: 커스텀 도메인 추가

1. **"Add"** 또는 **"+ Add Domain"** 클릭
2. 도메인 입력:
   - 예: `mynewstory.com`
3. **Add** 클릭

#### Step 3: DNS 설정 선택

Vercel이 두 가지 옵션을 제시합니다:

**옵션 A: Nameservers 변경** (권장하지 않음)
- DNS 제어권을 Vercel로 이전
- 다른 서비스 사용 어려움

**옵션 B: CNAME 레코드 추가** (권장) ✅
- Namecheap에서 이미 설정한 CNAME 사용
- "I'll manage my DNS records" 선택

#### Step 4: DNS 레코드 확인

Vercel이 제공하는 CNAME 정보:

```
Host: mynewstory.com (또는 루트)
Target: cname.vercel-dns.com
```

Namecheap에서 이미 이 레코드를 추가했으므로 완료입니다.

**예상 시간:** 2분

### 5-5. DNS 설정 확인 및 대기

#### DNS 전파 시간

```
즉시: Namecheap에서 레코드 추가
1-2분: 일부 ISP에서 인식
2-4시간: 대부분의 지역에서 적용
24시간: 전 세계 완전 적용
```

#### 설정 확인 명령어

```bash
# DNS 레코드 확인
nslookup mynewstory.com
# 응답: 대상 Vercel/Railway 서버 IP 또는 CNAME

# Vercel 도메인 연결 확인
curl -v https://mynewstory.com
# 응답: 200 OK

# API 도메인 확인
curl -v https://api.mynewstory.com/api
# 응답: {"message":"Hello World!"}
```

**예상 시간:** 5-30분 (DNS 전파 대기)

### 5-6. 환경 변수 업데이트

도메인이 설정되면 환경 변수를 업데이트합니다.

#### Vercel 환경 변수 업데이트

1. **Vercel Dashboard** → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 다음 변수 수정:

| 변수명 | 기존 값 | 새로운 값 |
|--------|--------|---------|
| `NEXT_PUBLIC_API_URL` | `https://api.bigtrust.site` | `https://api.mynewstory.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://bigtrust.site` | `https://mynewstory.com` |

4. **Save** 클릭
5. 자동 배포 대기

#### Railway 환경 변수 업데이트

1. **Railway Dashboard** → 프로젝트 선택
2. **Settings** → **Variables**
3. 다음 변수 수정:

| 변수명 | 기존 값 | 새로운 값 |
|--------|--------|---------|
| `FRONTEND_URL` | `https://bigtrust.site` | `https://mynewstory.com` |
| `REVALIDATE_URL` | `https://bigtrust.site/api/revalidate` | `https://mynewstory.com/api/revalidate` |

4. **Save** 클릭

#### n8n 환경 변수 업데이트

1. **n8n Cloud** 접속
2. **Settings** → **Variables**
3. 다음 변수 수정:

| 변수명 | 새로운 값 |
|--------|---------|
| `BACKEND_URL` | `https://api.mynewstory.com` |
| `FRONTEND_URL` | `https://mynewstory.com` |

4. **Save** 클릭

**예상 시간:** 3분

### 5-7. 최종 테스트

```bash
# Frontend 확인
curl -v https://mynewstory.com
# 응답: 200 OK + 홈페이지 HTML

# Backend API 확인
curl https://api.mynewstory.com/api
# 응답: {"message":"Hello World!"}

# ISR 재검증 확인
curl -X POST https://mynewstory.com/api/revalidate \
  -H "x-revalidate-secret: [REVALIDATE_SECRET]" \
  -H "Content-Type: application/json" \
  -d '{"slug": "test"}'
# 응답: {"revalidated": true}
```

**예상 시간:** 2분

---

## 📋 도메인 설정 체크리스트

- [ ] 도메인 등록사 선택 (Namecheap 추천)
- [ ] 새로운 도메인 구매 (예: mynewstory.com)
- [ ] Namecheap DNS 레코드 추가
  - [ ] @ → cname.vercel-dns.com (Root)
  - [ ] www → cname.vercel-dns.com
  - [ ] api → [Railway CNAME]
- [ ] Railway 커스텀 도메인 추가 (api.mynewstory.com)
- [ ] Vercel 커스텀 도메인 추가 (mynewstory.com)
- [ ] DNS 전파 대기 (5-30분)
- [ ] Vercel 환경 변수 업데이트 (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL)
- [ ] Railway 환경 변수 업데이트 (FRONTEND_URL, REVALIDATE_URL)
- [ ] n8n 환경 변수 업데이트 (BACKEND_URL, FRONTEND_URL)
- [ ] Frontend HTTPS 접근 확인
- [ ] Backend API HTTPS 접근 확인
- [ ] ISR 재검증 API 작동 확인

**총 예상 시간: 20분 (DNS 전파 대기 제외)**

---

**다음 단계 (선택):**
- Google Search Console 등록
- Sitemap 제출
- robots.txt 설정
- AdSense 계정 연동
- 성능 모니터링 (Sentry, New Relic)
- SSL 인증서 자동 갱신 (Vercel/Railway가 자동 처리)
