# Week 3: Railway + Vercel + n8n 배포 완전 가이드

**US Stock Story 프로덕션 배포 및 자동화 파이프라인 구성**

---

## 📋 배포 순서 (권장)

1. **Railway: NestJS + MySQL 배포** (1-2시간)
2. **Vercel: Next.js 배포** (30분)
3. **n8n Cloud: 워크플로우 구성** (1-2시간)
4. **통합 테스트** (30분)

**예상 전체 소요 시간**: 약 4-5시간

---

## 🚀 Step 1: Railway 배포 (NestJS + MySQL)

### 1-1. Railway 계정 생성 및 프로젝트 생성

1. [railway.app](https://railway.app) 접속
2. GitHub 계정으로 로그인 (또는 이메일)
3. **"New Project"** 클릭
4. **"Deploy from GitHub"** 선택
5. GitHub 계정 연결 (처음이면 OAuth)
6. Repository 선택: `YOUR_GITHUB/TEST3` (또는 해당 repo)
7. Branch: `main` 선택
8. **Deploy** 클릭

### 1-2. Railway 환경 변수 설정

1. Railway 프로젝트 대시보드 접속
2. 좌측 **"Variables"** 탭 클릭
3. 각 환경 변수 추가:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=mysql://root:password@mysql-host:3306/stock_blog
JWT_SECRET=your-jwt-secret-at-least-32-chars
JWT_EXPIRATION=7d
N8N_SECRET_KEY=your-n8n-secret-key-at-least-32-chars
ANTHROPIC_API_KEY=sk-ant-xxxxx
FRONTEND_URL=https://usstockstory.com
REVALIDATE_SECRET=your-revalidate-secret-key
LOG_LEVEL=info
```

### 1-3. Railway MySQL 플러그인 생성

1. Railway 프로젝트 대시보드
2. 우측 상단 **"+ Add"** 클릭
3. **Marketplace** 선택
4. **MySQL** 검색 → 선택
5. **Add Plugin** 클릭
6. **Variables** 탭에서 자동 생성된 `DATABASE_URL` 확인

### 1-4. NestJS 배포 설정 확인

Railway는 `railway.json` 또는 `Procfile`을 자동으로 인식합니다.

- **railway.json**: `{ "deploy": { "startCommand": "npm run migration:run && npm run start" } }`
- **Procfile**: `web: npm run migration:run && npm run start`

Repository에 이미 추가했으므로 자동으로 인식됩니다.

### 1-5. 배포 진행 확인

1. 우측 상단 **"Deployments"** 탭 클릭
2. 최신 배포 진행 상황 확인
3. **"Logs"**에서 실시간 로그 확인
4. 완료 후 **"Open"** 클릭하여 배포된 URL 확인

### 1-6. MySQL 마이그레이션 자동 실행 확인

`startCommand: "npm run migration:run && npm run start"`가 자동으로 실행되므로:
- ✅ 마이그레이션 자동 실행
- ✅ 테이블 생성
- ✅ NestJS 서버 시작

### 1-7. Railway 도메인 할당

Railway는 자동으로 `.railway.app` 도메인 할당:
```
https://your-project-xxxxx.railway.app
```

나중에 Cloudflare를 통해 `api.usstockstory.com`으로 라우팅.

---

## 🌐 Step 2: Vercel 배포 (Next.js)

### 2-1. Vercel 계정 생성

1. [vercel.com](https://vercel.com) 접속
2. GitHub 계정으로 가입 (또는 이메일)
3. GitHub 계정 연결

### 2-2. Next.js 프로젝트 Import

1. Vercel 대시보드 → **"Add New..."** → **"Project"**
2. **"Import Git Repository"**
3. GitHub 계정 선택
4. Repository: `YOUR_GITHUB/TEST3` 선택
5. **Import** 클릭

### 2-3. 프로젝트 설정

Vercel이 자동으로 감지:
- **Framework**: Next.js
- **Root Directory**: `./frontend` (이미 `vercel.json`에 설정됨)
- **Build Command**: 자동
- **Install Command**: 자동

### 2-4. 환경 변수 설정

1. **Settings** 탭 클릭
2. **"Environment Variables"** 선택
3. 각 변수 추가:

```
NEXT_PUBLIC_API_URL=https://api.usstockstory.com
NEXT_PUBLIC_SITE_URL=https://usstockstory.com
NEXT_PUBLIC_ADSENSE_ID=ca-pub-3811219422484638
REVALIDATE_SECRET=your-revalidate-secret-key
```

### 2-5. 배포 시작

1. 설정 완료 후 **"Deploy"** 클릭
2. 배포 진행 확인 (약 3-5분)
3. 완료 후 배포된 URL 확인

### 2-6. Vercel 커스텀 도메인 설정

1. **Settings** → **"Domains"**
2. **"Add"** 클릭
3. 도메인 입력: `usstockstory.com`
4. Vercel 네임서버 지시사항 따르기 (또는 CNAME)

---

## 🔗 Step 3: Cloudflare DNS 설정 (선택사항, 권장)

### 3-1. Cloudflare 네임서버 변경 (도메인 레지스트라)

도메인을 구매한 GoDaddy, Namecheap 등에서:
1. **DNS 설정** → **네임서버 변경**
2. Cloudflare 네임서버로 변경:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
3. 저장 (24-48시간 소요)

### 3-2. Cloudflare DNS 레코드 추가

1. Cloudflare 대시보드 접속
2. **DNS** 탭
3. **"+ Add record"**

#### A레코드 (프론트엔드):
- **Type**: CNAME
- **Name**: `usstockstory.com` (또는 @)
- **Target**: Vercel이 제공한 CNAME
- **Proxied**: OFF (DNS only)

#### A레코드 (백엔드):
- **Type**: CNAME
- **Name**: `api`
- **Target**: Railway가 제공한 도메인 (`.railway.app`)
- **Proxied**: OFF

### 3-3. SSL/TLS 설정

1. **SSL/TLS** → **Overview**
2. **Flexible** (자동)로 설정되어 있는지 확인

---

## 🤖 Step 4: n8n Cloud 워크플로우 설정

[n8n-workflows/README.md](./n8n-workflows/README.md) 참고

### 빠른 체크리스트:

1. ✅ n8n Cloud 계정 생성
2. ✅ Anthropic API Credential 추가
3. ✅ 3개 워크플로우 생성:
   - `01-morning-briefing` (08:00 KST)
   - `02-afternoon-analysis` (14:00 KST)
   - `03-evening-recap` (22:00 KST)
4. ✅ 각 워크플로우 테스트 (Manual Trigger)
5. ✅ Schedule Trigger로 자동 실행 설정
6. ✅ Discord 알림 테스트

---

## ✅ Step 5: 통합 테스트

### 5-1. Backend API 테스트

```bash
# NestJS 건강 확인
curl https://api.usstockstory.com/api

# Swagger 문서 확인
curl https://api.usstockstory.com/api/docs
```

**예상 응답**:
```json
{
  "message": "Hello World!"
}
```

### 5-2. Frontend 배포 확인

```bash
# 브라우저에서
https://usstockstory.com

# 확인 사항:
# - 홈 페이지 로드 됨
# - 헤더 네비게이션 작동
# - 다크모드 토글 작동
# - 최신 포스트 로드 됨
```

### 5-3. ISR 재검증 API 테스트

```bash
curl -X POST https://usstockstory.com/api/revalidate \
  -H "x-revalidate-secret: your-revalidate-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"slug": "test-slug"}'

# 예상 응답:
# { "revalidated": true, "message": "Cache revalidated for test-slug" }
```

### 5-4. n8n → Backend 연동 테스트

n8n Cloud 웹사이트에서:

1. 워크플로우 선택: `01-morning-briefing`
2. Schedule Trigger를 Manual로 변경 (테스트용)
3. **"Activate"** 클릭
4. **"Execute Workflow"** 클릭
5. 포스트 발행 확인:
   ```bash
   curl https://api.usstockstory.com/api/posts/published?limit=1
   ```
   → `is_ai_generated: true`인 포스트가 생성되었는지 확인

### 5-5. ISR 재검증 자동 실행 확인

n8n에서 포스트 발행 후:

1. Frontend `/api/revalidate` 호출됨 (n8n에서 자동)
2. Frontend 캐시 무효화
3. Browser에서 새 포스트 확인:
   ```bash
   https://usstockstory.com
   # → 새 포스트가 홈에 표시됨 (5분 이내)
   ```

### 5-6. Discord 알림 확인

n8n 워크플로우 실행 시 Discord 채널에서:

```
🌍 프리마켓 브리핑 발행
[포스트 제목]
https://usstockstory.com/post/[slug]
```

---

## 🔧 환경 변수 최종 체크리스트

### Backend (.env.production)

| 변수 | Railway 설정 | 설명 |
|---|---|---|
| `NODE_ENV` | `production` | 프로덕션 모드 |
| `PORT` | `3001` | NestJS 포트 |
| `DATABASE_URL` | Railway MySQL 플러그인 자동 생성 | MySQL 연결 |
| `JWT_SECRET` | 32글자 이상 난수 | JWT 서명 키 |
| `N8N_SECRET_KEY` | 32글자 이상 난수 | n8n 인증 |
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxx` | Claude API |
| `FRONTEND_URL` | `https://usstockstory.com` | Frontend 도메인 |
| `REVALIDATE_SECRET` | 32글자 이상 난수 | ISR 비밀키 |

### Frontend (.env.production)

| 변수 | Vercel 설정 | 설명 |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.usstockstory.com` | Backend API |
| `NEXT_PUBLIC_SITE_URL` | `https://usstockstory.com` | 사이트 도메인 |
| `NEXT_PUBLIC_ADSENSE_ID` | `ca-pub-xxxxx` | AdSense ID |
| `REVALIDATE_SECRET` | 32글자 이상 난수 | ISR 비밀키 (Backend와 동일) |

### n8n Cloud

| 변수 | 설정 | 설명 |
|---|---|---|
| `N8N_SECRET_KEY` | 32글자 이상 난수 | Backend와 동일 |
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxx` | Claude API |
| `REVALIDATE_SECRET` | 32글자 이상 난수 | Frontend와 동일 |
| `DISCORD_WEBHOOK_URL` | Discord webhook | 알림용 |

---

## 🛑 배포 후 체크

### 배포 24시간 후

1. ✅ n8n 첫 자동 실행 확인
2. ✅ 포스트 발행되었는지 확인
3. ✅ Frontend에 새 포스트 표시되는지 확인
4. ✅ Discord 알림 도착했는지 확인

### 배포 1주일 후

1. ✅ n8n Executions 탭에서 3개 워크플로우 모두 실행 기록 확인
2. ✅ Backend `/admin/ai-logs`에서 AI 로그 확인
3. ✅ Frontend 트래픽 모니터링 (Vercel Analytics)
4. ✅ Claude API 사용량 확인 (Anthropic 대시보드)

---

## 📊 모니터링

### Railway 모니터링

1. **Deployments**: 배포 성공 여부
2. **Logs**: 서버 로그 확인
3. **Metrics**: CPU, Memory, Network 사용량

### Vercel 모니터링

1. **Deployments**: 배포 성공 여부
2. **Functions**: Serverless 함수 성능
3. **Analytics**: 트래픽 및 성능 지표

### n8n 모니터링

1. **Executions**: 워크플로우 실행 로그
2. **Failed Executions**: 실패한 실행 분석

---

## 🆘 문제 해결

### "Cannot connect to database"

**원인**: DATABASE_URL이 잘못되었거나 MySQL 플러그인이 시작되지 않음

**해결**:
1. Railway 대시보드에서 MySQL 플러그인이 "Running" 상태인지 확인
2. Variables에서 DATABASE_URL 확인
3. NestJS 로그에서 "TypeOrmModule initialized" 메시지 확인

### "n8n authorization failed (401)"

**원인**: N8N_SECRET_KEY가 일치하지 않음

**해결**:
1. Railway N8N_SECRET_KEY 값 확인
2. n8n 워크플로우의 `x-n8n-secret` 헤더 값 일치 확인

### "ISR revalidation failed"

**원인**: REVALIDATE_SECRET이 일치하지 않거나 Frontend가 배포되지 않음

**해결**:
1. Vercel REVALIDATE_SECRET 값 확인
2. Frontend 배포 상태 확인
3. Frontend 도메인이 DNS에 올바르게 설정되었는지 확인

### "Claude API rate limit exceeded"

**원인**: 월 할당량 초과

**해결**:
1. Anthropic 대시보드에서 사용량 확인
2. 필요시 Claude API 계획 업그레이드

---

## 💰 비용 추정

| 서비스 | 월 비용 | 비고 |
|---|---|---|
| Railway (NestJS + MySQL) | $5 | 기본 플랜 |
| Vercel (Next.js) | $0 | 무료 플랜 (트래픽 100GB) |
| n8n Cloud | $0 | 무료 플랜 (5000 실행/월) |
| Claude API (Haiku) | ~$1-2 | 3포스트/일 기준 |
| Cloudflare (DNS) | $0 | 무료 플랜 |
| 도메인 | ~$10 | 1년 기준 |
| **총합** | **~$16-17** | **/월** |

---

## 🎉 완료!

배포가 완료되면:

- ✅ Backend: `https://api.usstockstory.com`
- ✅ Frontend: `https://usstockstory.com`
- ✅ n8n: 매일 3회 자동 포스트 발행
- ✅ Discord: 포스트 발행 시 자동 알림

**축하합니다! US Stock Story 프로덕션 배포 완료!** 🚀
