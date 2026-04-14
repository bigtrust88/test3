# 🚀 최종 배포 가이드 (bigtrust.site)

## 현재 상황 (2026-04-14 기준)

| 항목 | 상태 | URL |
|------|------|-----|
| GitHub 코드 | ✅ 완료 | https://github.com/bigtrust88/test3 |
| Vercel 프론트엔드 | ✅ 배포 완료 | https://frontend-4igrzken4-bigtrust88s-projects.vercel.app |
| bigtrust.site 도메인 | ⏳ DNS 설정 필요 | https://bigtrust.site |
| Railway 백엔드 | ✅ 배포됨 (MySQL 추가 필요) | https://api.bigtrust.site |
| MySQL 데이터베이스 | ❌ 아직 미설정 | Railway에 추가 필요 |
| n8n 자동화 | ❌ 아직 미설정 | 설정 필요 |

---

## Phase 1: Railway MySQL 추가 ← 지금 해야 할 것

> Railway에 MySQL을 추가하면 포스트 발행/저장이 가능해집니다.

### 1-1. MySQL 플러그인 추가

1. [railway.app](https://railway.app) 접속 → 프로젝트 선택
2. 좌측 상단 **"+ New"** 클릭
3. **"Database"** 선택
4. **"Add MySQL"** 클릭
5. MySQL 서비스가 생성될 때까지 대기 (약 30초)

### 1-2. MYSQL_URL 확인

MySQL이 생성되면 자동으로 환경 변수가 추가됩니다.

1. MySQL 서비스 클릭 → **Variables** 탭
2. 다음 변수들이 자동 생성됨:

| 변수명 | 설명 |
|--------|------|
| `MYSQL_URL` | 전체 연결 문자열 (백엔드에서 자동으로 사용) |
| `MYSQL_HOST` | DB 호스트 |
| `MYSQL_PORT` | DB 포트 (3306) |
| `MYSQL_USER` | DB 사용자명 |
| `MYSQL_PASSWORD` | DB 비밀번호 |
| `MYSQL_DATABASE` | DB 이름 |

> ⚠️ **`MYSQL_URL`이 보이면 완료!** 백엔드가 자동으로 이 값을 사용합니다.

### 1-3. 백엔드 환경 변수 설정

Railway **백엔드 서비스** → Variables 탭에서 아래 변수 추가:

| 변수명 | 값 | 비고 |
|--------|----|------|
| `NODE_ENV` | `production` | |
| `PORT` | `3001` | |
| `JWT_SECRET` | 32자 이상 무작위 문자열 | 예: `jF9mK2xL5qW8pR3vN7sH4dG6tJ1bM0cE` |
| `JWT_EXPIRATION` | `7d` | |
| `N8N_SECRET_KEY` | 32자 이상 무작위 문자열 | n8n과 동일한 값 사용 |
| `REVALIDATE_SECRET` | 32자 이상 무작위 문자열 | n8n과 동일한 값 사용 |
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxx` | Claude API 키 |
| `FRONTEND_URL` | `https://bigtrust.site` | |

> 💡 무작위 문자열 생성 방법: [passwordsgenerator.net](https://passwordsgenerator.net) 에서 32자 생성

### 1-4. 백엔드 재배포 확인

변수 추가 후 Railway가 자동으로 재배포합니다.

1. **Deployments** 탭 → 최신 배포 상태 확인
2. **Logs** 탭에서 다음 확인:
   ```
   ✅ Application is running on: http://localhost:3001
   ✅ @napi-rs/canvas Fonts registered successfully
   ```
3. 에러가 없으면 완료

---

## Phase 2: Vercel 프론트엔드 환경 변수 설정

Vercel에서 백엔드 URL이 올바르게 설정되어 있어야 합니다.

1. [vercel.com](https://vercel.com) → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 다음 변수 확인/추가:

| 변수명 | 값 |
|--------|----|
| `NEXT_PUBLIC_API_URL` | `https://api.bigtrust.site` |
| `NEXT_PUBLIC_SITE_URL` | `https://bigtrust.site` |
| `REVALIDATE_SECRET` | Railway의 REVALIDATE_SECRET과 동일한 값 |

4. **Save** → 자동 재배포 대기

---

## Phase 3: bigtrust.site 도메인 연결

### 3-1. Vercel에 도메인 추가

1. Vercel → 프로젝트 → **Settings** → **Domains**
2. `bigtrust.site` 입력 → **Add**
3. Vercel이 제공하는 DNS 값 확인

### 3-2. 가비아 DNS 설정

1. [가비아](https://www.gabia.com) 로그인
2. **My가비아** → **도메인 관리** → `bigtrust.site` 선택
3. **DNS 정보** → **DNS 관리**
4. 다음 레코드 추가:

| 타입 | 호스트 | 값 | TTL |
|------|--------|-----|-----|
| CNAME | `@` | `cname.vercel-dns.com` | 3600 |
| CNAME | `www` | `cname.vercel-dns.com` | 3600 |
| CNAME | `api` | `[Railway 제공 CNAME]` | 3600 |

> Railway CNAME: Railway 프로젝트 → Settings → Domains → Custom Domain 추가 시 확인

### 3-3. Railway에 api.bigtrust.site 연결

1. Railway → 백엔드 서비스 → **Settings** → **Networking**
2. **Custom Domain** → `api.bigtrust.site` 입력
3. Railway가 제공하는 CNAME 값을 가비아 DNS에 입력 (위 3-2 참고)

---

## Phase 4: n8n 자동화 설정

> 자세한 내용은 **N8N-QUICK-START.md** 참고

### 빠른 요약

1. [n8n.io](https://n8n.io) 가입 → 무료 플랜
2. Credentials → Anthropic API Key 추가
3. 워크플로우 3개 생성:
   - `01-morning-briefing` → Cron: `0 23 * * *` (KST 08:00)
   - `02-afternoon-analysis` → Cron: `0 5 * * *` (KST 14:00)
   - `03-evening-recap` → Cron: `0 13 * * *` (KST 22:00)
4. 각 워크플로우에서 사용하는 값:
   - 백엔드 API: `https://api.bigtrust.site`
   - `X-N8N-Secret`: Railway의 `N8N_SECRET_KEY`와 동일
   - ISR 갱신 URL: `https://bigtrust.site/api/revalidate`
   - `x-revalidate-secret`: Railway의 `REVALIDATE_SECRET`와 동일

---

## 📋 최종 체크리스트

### Railway 백엔드
- [ ] MySQL 플러그인 추가 완료
- [ ] `MYSQL_URL` 자동 생성 확인
- [ ] 환경 변수 8개 설정 완료
- [ ] 백엔드 재배포 성공 (Logs에 에러 없음)
- [ ] `https://api.bigtrust.site/api` 응답 확인

### Vercel 프론트엔드
- [ ] `NEXT_PUBLIC_API_URL` = `https://api.bigtrust.site` 확인
- [ ] `REVALIDATE_SECRET` 설정 확인
- [ ] 재배포 성공 확인

### 도메인
- [ ] Vercel에 `bigtrust.site` 추가
- [ ] Railway에 `api.bigtrust.site` 추가
- [ ] 가비아 DNS CNAME 레코드 3개 추가
- [ ] DNS 전파 후 `https://bigtrust.site` 접속 확인

### n8n 자동화
- [ ] Anthropic Credential 추가
- [ ] 워크플로우 3개 생성 및 테스트
- [ ] 3개 모두 Active 상태
- [ ] bigtrust.site에 포스트 자동 발행 확인

---

## 🔧 문제 해결

### Railway 백엔드 에러
```bash
# Logs 탭에서 확인
# 주요 에러:
# - "ECONNREFUSED" → MYSQL_URL 변수 없음, MySQL 플러그인 추가 필요
# - "Access denied for user" → MYSQL_URL 값 오류
# - "listen EADDRINUSE" → 이미 실행 중 (무시 가능)
```

### bigtrust.site가 안 보일 때
```bash
# DNS 전파 확인 (터미널)
nslookup bigtrust.site

# 정상이면: cname.vercel-dns.com을 가리킴
# 비정상이면: DNS 전파 대기 (최대 24시간)
```

### n8n 포스트 발행 실패
```
401 에러 → N8N_SECRET_KEY 불일치
500 에러 → 데이터베이스 연결 실패 (Railway MySQL 확인)
```

---

## 📌 주요 URL 모음

| 서비스 | URL |
|--------|-----|
| 프론트엔드 (Vercel 원본) | https://frontend-4igrzken4-bigtrust88s-projects.vercel.app |
| 프론트엔드 (도메인) | https://bigtrust.site |
| 백엔드 API | https://api.bigtrust.site |
| 백엔드 API 문서 | https://api.bigtrust.site/api/docs |
| GitHub | https://github.com/bigtrust88/test3 |
| Railway | https://railway.app |
| Vercel | https://vercel.com |
