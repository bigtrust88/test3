# 🚀 배포 완전 체크리스트

## Phase 1: GitHub ✅ DONE
- [x] GitHub 저장소 생성: https://github.com/bigtrust88/test3
- [x] 코드 푸시 (127개 파일)
- [x] main 브랜치 설정

---

## Phase 2: Railway (NestJS + MySQL) ⏳ IN PROGRESS

### 2-1. 프로젝트 생성
- [ ] [railway.app](https://railway.app) 로그인
- [ ] **"New Project"** → **"Deploy from GitHub"**
- [ ] Repository: `bigtrust88/test3` 선택
- [ ] Branch: `main` 선택
- [ ] **Deploy** 클릭

### 2-2. MySQL 플러그인 추가
- [ ] Railway 대시보드 → **"+ Add"**
- [ ] **Marketplace** → **MySQL**
- [ ] **Add Plugin** 클릭
- [ ] `DATABASE_URL` 자동 생성 확인

### 2-3. 환경 변수 설정
다음을 Railway **Variables** 탭에 입력:

- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `LOG_LEVEL=info`
- [ ] `JWT_SECRET=` [32글자 이상 난수]
- [ ] `JWT_EXPIRATION=7d`
- [ ] `N8N_SECRET_KEY=` [32글자 이상 난수]
- [ ] `ANTHROPIC_API_KEY=sk-ant-xxxxx`
- [ ] `FRONTEND_URL=https://usstockstory.com`
- [ ] `REVALIDATE_SECRET=` [32글자 이상 난수]

**참고**: `RAILWAY-ENV-SETUP.md` 파일 참고

### 2-4. 배포 확인
- [ ] **Deployments** 탭에서 배포 완료 확인
- [ ] **Logs** 탭에서 "✅ Application is running" 메시지 확인
- [ ] 터미널에서 배포된 URL 확인:
  ```bash
  curl https://[your-railway-url]/api
  ```
  응답: `{"message":"Hello World!"}`

### 2-5. MySQL 테스트
- [ ] Railway MySQL 플러그인이 "Running" 상태 확인
- [ ] 마이그레이션 자동 실행됨 (로그에서 확인)

---

## Phase 3: Vercel (Next.js) ⏳ IN PROGRESS

### 3-1. 프로젝트 생성
- [ ] [vercel.com](https://vercel.com) 로그인
- [ ] **"Add New..."** → **"Project"**
- [ ] **"Import Git Repository"**
- [ ] Repository: `bigtrust88/test3` 선택
- [ ] **Root Directory**: `./frontend` (자동 감지)
- [ ] **Import** 클릭

### 3-2. 환경 변수 설정
**Settings** → **Environment Variables** 탭에 입력:

- [ ] `NEXT_PUBLIC_API_URL=https://api.usstockstory.com`
- [ ] `NEXT_PUBLIC_SITE_URL=https://usstockstory.com`
- [ ] `NEXT_PUBLIC_ADSENSE_ID=ca-pub-3811219422484638`
- [ ] `REVALIDATE_SECRET=` [Railway의 값과 동일]

**참고**: `VERCEL-ENV-SETUP.md` 파일 참고

### 3-3. 배포 확인
- [ ] **Deployments** 탭에서 배포 완료 확인
- [ ] 배포된 URL (vercel.app) 방문:
  ```
  https://test3.vercel.app (또는 할당된 URL)
  ```
- [ ] 홈 페이지 로드 확인
- [ ] 다크모드 토글 작동 확인
- [ ] 포스트 카드 로드 확인

### 3-4. 커스텀 도메인 (선택사항)
- [ ] **Settings** → **Domains**
- [ ] **"Add"** → `usstockstory.com` 입력
- [ ] DNS 설정 지시사항 따르기

---

## Phase 4: Cloudflare DNS (선택사항) ⏳ OPTIONAL

### 4-1. 네임서버 변경 (도메인 레지스트라에서)
- [ ] GoDaddy / Namecheap / 등에서 네임서버 변경
- [ ] Cloudflare 네임서버:
  ```
  ns1.cloudflare.com
  ns2.cloudflare.com
  ```

### 4-2. DNS 레코드 추가 (Cloudflare 대시보드)
- [ ] **DNS** → **"+ Add record"**
- [ ] Frontend (프론트엔드):
  - Type: CNAME
  - Name: `@` (또는 `usstockstory.com`)
  - Target: [Vercel CNAME]
  - Proxied: OFF
- [ ] Backend (백엔드):
  - Type: CNAME
  - Name: `api`
  - Target: [Railway URL]
  - Proxied: OFF

---

## Phase 5: n8n Cloud ⏳ IN PROGRESS

### 5-1. n8n Cloud 계정 생성
- [ ] [n8n.io](https://n8n.io) → "Get Started"
- [ ] 무료 플랜 선택
- [ ] 계정 생성

### 5-2. Credentials 설정
- [ ] **Credentials** → **"+ New"** → **Anthropic**
- [ ] **API Key**: `sk-ant-xxxxx`
- [ ] **Save**

### 5-3. 3개 워크플로우 생성

각 워크플로우에 대해:

#### 01-morning-briefing (08:00 KST)
- [ ] 워크플로우 이름: `01-morning-briefing`
- [ ] Schedule Cron: `0 23 * * *` (UTC 23:00)
- [ ] trigger_type: `morning`
- [ ] RSS URL: Reuters business feed
- [ ] 10단계 노드 구성 (자세한 내용은 `n8n-workflows/README.md`)
- [ ] Manual Trigger로 테스트 실행
- [ ] 포스트 발행 확인

#### 02-afternoon-analysis (14:00 KST)
- [ ] 워크플로우 이름: `02-afternoon-analysis`
- [ ] Schedule Cron: `0 5 * * *` (UTC 05:00)
- [ ] trigger_type: `afternoon`
- [ ] RSS URL: Seeking Alpha
- [ ] Manual Trigger로 테스트 실행

#### 03-evening-recap (22:00 KST)
- [ ] 워크플로우 이름: `03-evening-recap`
- [ ] Schedule Cron: `0 13 * * *` (UTC 13:00)
- [ ] trigger_type: `evening`
- [ ] RSS URL: AP Business
- [ ] Manual Trigger로 테스트 실행

### 5-4. 워크플로우 활성화
- [ ] Schedule Trigger로 변경
- [ ] **"Activate"** 클릭 (자동 실행 시작)

**참고**: `N8N-QUICK-START.md` 및 `n8n-workflows/README.md` 파일 참고

---

## Phase 6: 통합 테스트 ⏳ IN PROGRESS

### 6-1. Backend API 테스트
```bash
# Health check
curl https://api.usstockstory.com/api
# 응답: {"message":"Hello World!"}

# Swagger 문서
curl https://api.usstockstory.com/api/docs
```
- [ ] 위 명령어 실행 확인

### 6-2. Frontend 테스트
- [ ] https://usstockstory.com (또는 vercel.app) 접속
- [ ] 홈 페이지 로드 확인
- [ ] 헤더 네비게이션 작동 확인
- [ ] 다크모드 토글 작동 확인
- [ ] 최신 포스트 로드 확인
- [ ] 카테고리 페이지 접속 확인

### 6-3. ISR 재검증 API 테스트
```bash
curl -X POST https://usstockstory.com/api/revalidate \
  -H "x-revalidate-secret: [REVALIDATE_SECRET]" \
  -H "Content-Type: application/json" \
  -d '{"slug": "test-post"}'
```
- [ ] 응답: `{"revalidated": true, ...}`

### 6-4. n8n → Backend 연동 테스트
- [ ] n8n 워크플로우 Manual Trigger 실행
- [ ] Backend 로그에서 포스트 발행 확인
- [ ] Frontend에서 새 포스트 표시 확인 (5분 이내)

### 6-5. Discord 알림 테스트
- [ ] n8n 워크플로우 실행 후 Discord 채널 확인
- [ ] 알림이 도착하는지 확인

---

## ✨ 완료 확인사항

### 배포 완료 체크
- [ ] Backend: `https://api.usstockstory.com` (Railway)
- [ ] Frontend: `https://usstockstory.com` (Vercel)
- [ ] n8n: 3개 워크플로우 자동 실행 중
- [ ] Discord: 포스트 발행 알림 자동 도착

### 비용 확인
- [ ] Railway: $5/월 (NestJS + MySQL)
- [ ] Vercel: $0 (무료)
- [ ] n8n Cloud: $0 (무료, 월 5000 실행)
- [ ] Claude API: ~$1-2/월
- [ ] **총합: ~$6-7/월**

### 다음 단계 (선택사항)
- [ ] 실제 도메인 구매 및 DNS 설정 (Cloudflare)
- [ ] Google Search Console 등록
- [ ] 네이버 Search Advisor 등록
- [ ] AdSense 계정 연동

---

## 📞 문제 해결

각 단계에서 문제가 발생하면:
1. **Railway**: 로그 탭에서 에러 메시지 확인
2. **Vercel**: Deployments 탭에서 빌드 로그 확인
3. **n8n**: Executions 탭에서 실행 로그 확인
4. **WEEK3-DEPLOYMENT.md**: 문제 해결 섹션 참고

---

## 🎉 배포 완료!

모든 단계가 완료되면 자동화된 US Stock Story가 프로덕션에서 실행됩니다!
