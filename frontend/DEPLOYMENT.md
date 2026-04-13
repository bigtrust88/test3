# 배포 가이드 (Deployment Guide)

## 로컬 개발 (Local Development)

### 1. 초기 설정
```bash
cd frontend
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일이 이미 생성되어 있습니다.

**개발 환경 (`.env.local`)**:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADSENSE_ID=ca-pub-3811219422484638
```

**프로덕션 환경 (`.env.production`)**:
- 자동으로 사용됨 (Vercel에서 override 가능)

### 3. 개발 서버 실행
```bash
npm run dev
# 또는
npm run dev -- -p 3000  # 포트 지정
```

브라우저: `http://localhost:3000`

### 4. 빌드 검증
```bash
# TypeScript 타입 체크
npm run type-check

# ESLint 검사
npm run lint

# 프로덕션 빌드 테스트
npm run build
npm run start
```

### 5. 전체 검증 (배포 전)
```bash
npm run validate
```

---

## Vercel 배포 (Production Deployment)

### 1. Vercel 계정 및 프로젝트 연결

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포 (처음)
vercel

# 프로젝트 선택/생성하고 진행
```

또는 [Vercel 웹사이트](https://vercel.com) → GitHub 연결 → 자동 배포

### 2. 환경 변수 설정 (Vercel Dashboard)

**Vercel Dashboard → Settings → Environment Variables**

다음 변수를 **Production** 환경에 추가:

```
NEXT_PUBLIC_API_URL=https://api.usstockstory.com
NEXT_PUBLIC_SITE_URL=https://usstockstory.com
NEXT_PUBLIC_ADSENSE_ID=ca-pub-3811219422484638
```

### 3. 커스텀 도메인 연결

**Vercel Dashboard → Domains**

1. `usstockstory.com` 추가
2. DNS 레코드 설정:
   - Vercel이 제공하는 CNAME/A 레코드를 도메인 호스팅에서 설정
   - Cloudflare 사용 시 CNAME으로 연결

### 4. Cloudflare CDN 설정 (권장)

1. Cloudflare 계정에서 `usstockstory.com` 추가
2. DNS 레코드:
   ```
   CNAME  www     → cname.vercel-dns.com
   CNAME  (root)  → cname.vercel-dns.com  (또는 A 레코드)
   ```
3. Cloudflare Dashboard:
   - **Speed** → Auto Minify 활성화
   - **Caching** → Cache Everything (문제 시 조정)
   - **Security** → SSL/TLS = Full

### 5. 배포 트리거

```bash
# 로컬에서 푸시
git push origin main

# 또는 Vercel CLI
vercel --prod
```

---

## Backend 연동 확인

### API 엔드포인트 검증

Frontend의 `lib/api.ts`가 아래 엔드포인트를 호출합니다:

**인증 (Auth)**:
- `POST /auth/login` → LoginResponse (JWT 토큰)

**포스트 조회 (공개)**:
- `GET /posts?page=1&limit=10&search=...&category=...`
- `GET /posts/{slug}` → Post 상세
- `GET /categories` → Category[]
- `GET /tags` → Tag[]

**관리자 API (인증 필요)**:
- `GET /posts?is_published=false` → 비공개 포스트
- `POST /posts` → 포스트 생성
- `PUT /posts/{id}` → 포스트 수정
- `DELETE /posts/{id}` → 포스트 삭제

Backend가 이 엔드포인트들을 제공하는지 확인:

```bash
# Backend 실행 (별도 터미널)
cd backend
npm install
npm run start:dev

# 테스트
curl http://localhost:3001/posts
```

---

## 문제 해결 (Troubleshooting)

### 1. "API is not responding"
```
✅ Backend가 `http://localhost:3001`에서 실행 중인지 확인
✅ .env.local의 NEXT_PUBLIC_API_URL이 맞는지 확인
✅ Backend CORS 설정 확인
```

### 2. "AdSense 광고가 보이지 않음"
```
✅ NEXT_PUBLIC_ADSENSE_ID 확인
✅ 실제 도메인 접속 필요 (localhost에서는 안 됨)
✅ AdSense 계정에서 승인 대기 중일 수 있음
```

### 3. "로그인 후 리다이렉트 안 됨"
```
✅ Backend에서 JWT 토큰 형식 확인
✅ localStorage 접근 확인
✅ 브라우저 개발자 도구 → Application → Local Storage 확인
```

### 4. "다크모드가 적용 안 됨"
```
✅ next-themes 라이브러리 로드 확인
✅ tailwind.config.js에서 darkMode: 'class' 설정 확인
✅ localStorage에서 NEXT_THEME 키 확인
```

---

## 성능 최적화 (Performance)

### Image Optimization
- 모든 포스트 커버 이미지는 `next/image` 사용
- Cloudflare 또는 CDN에서 자동 최적화

### ISR (Incremental Static Regeneration)
- 포스트 페이지: `revalidate = 3600` (1시간)
- 카테고리 페이지: `revalidate = 3600`
- 사이트맵: 매일 재생성

### Code Splitting
- Next.js 자동 처리
- 각 페이지는 독립적 번들

---

## 모니터링 (Monitoring)

### Vercel Analytics
- Vercel Dashboard → Analytics
- Core Web Vitals 확인

### AdSense Performance
- `/admin/adsense` 대시보드
- 수익, CTR, 노출수 추적

### Backend Logs
- `/admin/ai-logs` 페이지
- n8n 자동화 실행 로그

---

## 다음 단계 (Next Steps)

1. ✅ Frontend: 배포 완료
2. ⏳ Backend: Railway 배포
3. ⏳ n8n: 3개 워크플로우 설정
4. ⏳ DNS: Cloudflare 연결

---

## 참고 문서

- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel 문서](https://vercel.com/docs)
- [Cloudflare 설정](https://developers.cloudflare.com)
