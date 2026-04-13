# 🚀 bigtrust.site 배포 체크리스트

**도메인:** bigtrust.site (가비아에서 구매 완료)

---

## ✅ 이미 완료된 항목

- [x] Frontend .env.production 도메인 변경
  - `NEXT_PUBLIC_API_URL=https://api.bigtrust.site`
  - `NEXT_PUBLIC_SITE_URL=https://bigtrust.site`
- [x] Backend .env.example 도메인 추가
  - `FRONTEND_URL=https://bigtrust.site` (Production)
- [x] 배포 가이드 업데이트 (모든 usstockstory.com → bigtrust.site)
- [x] 프로젝트 메모리 업데이트

---

## 📋 지금 할 일 (사용자가 직접)

### Phase 1: 가비아 DNS 설정 (5분)

**Step 1-1: 가비아 DNS 관리 페이지 접속**

1. https://dns.gabia.com 접속
2. **로그인**
3. **bigtrust.site** 도메인 선택
4. **DNS 관리** 또는 **고급 설정** 클릭

**Step 1-2: CNAME 레코드 추가**

다음 3개의 레코드를 추가합니다:

#### 레코드 1️⃣: Root 도메인 → Vercel Frontend

```
호스트명(Host):  @ (또는 루트)
타입(Type):      CNAME
값(Value):       cname.vercel-dns.com.
TTL:             3600
```

✓ **추가** 클릭

#### 레코드 2️⃣: www → Vercel Frontend (선택)

```
호스트명(Host):  www
타입(Type):      CNAME
값(Value):       cname.vercel-dns.com.
TTL:             3600
```

✓ **추가** 클릭

#### 레코드 3️⃣: api → Railway Backend

```
호스트명(Host):  api
타입(Type):      CNAME
값(Value):       epj14zid.up.railway.app.
TTL:             3600
```

⚠️ Railway CNAME 값은 Phase 2에서 얻습니다. 일단 "보류"로 두고, Phase 2 후에 추가하세요.

**Step 1-3: 설정 확인**

```
@ → cname.vercel-dns.com
www → cname.vercel-dns.com
api → [Railway CNAME] (나중에 추가)
```

**예상 시간:** 2분

---

### Phase 2: Vercel에서 도메인 연결 (3분)

**Step 2-1: Vercel 프로젝트 설정**

1. **Vercel Dashboard** 접속 (https://vercel.com)
2. Frontend 프로젝트 선택
3. **Settings** → **Domains** 클릭

**Step 2-2: bigtrust.site 추가**

1. **"Add"** 또는 **"+ Add Domain"** 클릭
2. 도메인 입력: **`bigtrust.site`**
3. **Add** 클릭

Vercel이 다음과 같이 표시합니다:

```
Status: Pending Verification
CNAME: bigtrust.site → cname.vercel-dns.com
```

✓ 가비아에서 이미 이 레코드를 추가했으므로 자동 인식됨

**Step 2-3: www 도메인도 추가 (선택)**

1. **"Add"** 다시 클릭
2. 도메인: **`www.bigtrust.site`**
3. **Add** 클릭

**예상 시간:** 2분

---

### Phase 3: Railway에서 도메인 연결 (3분)

**Step 3-1: Railway 프로젝트 설정**

1. **Railway Dashboard** 접속 (https://railway.app)
2. Backend 프로젝트 선택
3. **Project** → **Settings** 클릭
4. 좌측 메뉴 → **Domains** 클릭

**Step 3-2: api.bigtrust.site 추가**

1. **"+ Add Custom Domain"** 클릭
2. 도메인 입력: **`api.bigtrust.site`**
3. **Add** 클릭

Railway가 제시하는 CNAME:

```
CNAME: api.bigtrust.site → [railway-generated-cname]
```

⚠️ **이 CNAME 값을 복사해두세요!**

**Step 3-3: 가비아에 API 레코드 추가 (Phase 1에서 보류한 부분)**

1. 가비아 DNS 관리 페이지로 돌아가기
2. **레코드 3️⃣: api → Railway Backend** 추가
   - 호스트명: `api`
   - 타입: `CNAME`
   - 값: **Railway에서 복사한 CNAME**
3. **추가** 클릭

**예상 시간:** 2분

---

### Phase 4: DNS 전파 대기 (30분)

```
즉시:     가비아에서 반영
2-4시간:  대부분의 지역에서 적용
24시간:   전 세계 완전 적용
```

**대기 중에 할 일:**

진행할 동안 다음 명령어로 DNS 전파 상태 확인:

```bash
# bigtrust.site 확인
nslookup bigtrust.site

# api.bigtrust.site 확인
nslookup api.bigtrust.site
```

응답이 나오면 DNS 전파 완료입니다.

**예상 시간:** 2-4시간 (대기)

---

### Phase 5: HTTPS 인증서 설정 (자동)

Vercel과 Railway는 자동으로 Let's Encrypt SSL 인증서를 발급합니다.

- Vercel: DNS 확인 후 자동 발급
- Railway: DNS 확인 후 자동 발급

⚠️ **HTTPS로 접속 가능할 때까지 5-10분 대기**

```bash
# 인증서 확인
curl -v https://bigtrust.site
# HTTP/2 200 이 보이면 정상
```

**예상 시간:** 5-10분 (자동)

---

### Phase 6: 환경 변수 최종 설정 (3분)

**Step 6-1: Vercel 환경 변수 재확인**

1. **Vercel Dashboard** → Frontend 프로젝트
2. **Settings** → **Environment Variables**
3. 다음이 이미 설정되어 있는지 확인:

```
NEXT_PUBLIC_API_URL = https://api.bigtrust.site
NEXT_PUBLIC_SITE_URL = https://bigtrust.site
```

✓ 이미 설정되어 있으면 **자동 재배포 대기**

**Step 6-2: Railway 환경 변수 설정**

1. **Railway Dashboard** → Backend 프로젝트
2. **Settings** → **Variables**
3. 다음을 확인/수정:

```
FRONTEND_URL = https://bigtrust.site
```

4. **Save** 클릭

**Step 6-3: n8n 환경 변수 설정**

1. **n8n Cloud** 접속
2. **Settings** → **Variables**
3. 다음을 확인/수정:

```
BACKEND_URL = https://api.bigtrust.site
FRONTEND_URL = https://bigtrust.site
```

4. **Save** 클릭

**예상 시간:** 2분

---

### Phase 7: 최종 테스트 (5분)

```bash
# 1️⃣ Frontend 확인
curl -v https://bigtrust.site
# 응답: 200 OK + 홈페이지 HTML

# 2️⃣ Backend API 확인
curl https://api.bigtrust.site/api
# 응답: {"message":"Hello World!"}

# 3️⃣ ISR 재검증 확인
curl -X POST https://bigtrust.site/api/revalidate \
  -H "x-revalidate-secret: [REVALIDATE_SECRET]" \
  -H "Content-Type: application/json" \
  -d '{"slug": "test"}'
# 응답: {"revalidated": true}
```

**예상 시간:** 3분

---

## 🎯 배포 완료 체크리스트

- [ ] 가비아 DNS 레코드 3개 추가
  - [ ] @ → cname.vercel-dns.com
  - [ ] www → cname.vercel-dns.com (선택)
  - [ ] api → Railway CNAME
- [ ] Vercel에서 bigtrust.site 도메인 추가
- [ ] Vercel에서 www.bigtrust.site 도메인 추가 (선택)
- [ ] Railway에서 api.bigtrust.site 도메인 추가
- [ ] Railway CNAME을 가비아 API 레코드에 입력
- [ ] DNS 전파 대기 (2-4시간)
- [ ] HTTPS 인증서 자동 발급 대기 (5-10분)
- [ ] Vercel 환경 변수 확인
- [ ] Railway 환경 변수 설정
- [ ] n8n 환경 변수 설정
- [ ] https://bigtrust.site 접속 확인
- [ ] https://api.bigtrust.site/api 응답 확인
- [ ] ISR 재검증 API 작동 확인

**총 예상 시간: 20분 (DNS 전파 대기 제외)**

---

## 🔗 바로가기

- **가비아 DNS**: https://dns.gabia.com
- **Vercel Dashboard**: https://vercel.com
- **Railway Dashboard**: https://railway.app
- **n8n Cloud**: https://n8n.io

---

## 💡 팁

- DNS 전파 중에는 일부 사람들이 구 도메인으로 접속될 수 있습니다
- 브라우저 캐시 때문에 오래된 DNS가 나타날 수 있으니, 시크릿 창에서 테스트하세요
- 혹시 HTTPS 인증서가 안 나오면 24시간 대기 후 다시 확인하세요

---

**다음 단계:** 모든 테스트가 완료되면 n8n 워크플로우를 활성화하고 일일 자동 배포를 시작합니다!
