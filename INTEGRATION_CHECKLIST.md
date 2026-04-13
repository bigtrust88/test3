# Frontend ↔ Backend 통합 체크리스트

## ✅ 완료된 작업

### 1. 의존성 추가
- [x] `dompurify` + `isomorphic-dompurify` → package.json 추가
- [x] `npm run validate` 스크립트 추가 (타입 체크 + 린트 + 빌드)
- [x] `npm run type-check` 스크립트 추가

### 2. API 호환성 수정
- [x] **Backend QueryPostsDto** 수정
  - [x] `category` 파라미터 추가 (slug 기반)
  - [x] `tag` 파라미터 추가 (slug 기반)
  - [x] slug → ID 자동 변환 로직 추가

- [x] **Frontend api.ts** 수정
  - [x] `getPosts()` → `GET /posts/published` 변경
  - [x] `getPostBySlug()` → `GET /posts/published/{slug}` 변경 (응답 형식 수정)
  - [x] 모든 Admin API → `/posts` (JWT 필요) 통일
  - [x] `sortBy` → `sort` 파라미터명 통일

- [x] **Frontend types.ts** 수정
  - [x] `LoginResponse`에 `refresh_token` 옵션 필드 추가

- [x] **Frontend post/[slug]/page.tsx** 수정
  - [x] `getPostBySlug()` 응답 처리 수정 (postRes.data → postRes)

### 3. 배포 설정
- [x] `vercel.json` 생성 (Vercel 배포 설정)
- [x] `.env.production` 생성 (프로덕션 환경 변수)
- [x] `DEPLOYMENT.md` 생성 (배포 가이드)

---

## 🔍 검증 절차 (로컬 테스트)

### Step 1: Backend 실행
```bash
cd backend
npm install
npm run start:dev
# 콘솔 메시지: "Application is running on: http://localhost:3001" 확인
```

### Step 2: Frontend 검증
```bash
cd frontend
npm install
npm run type-check        # TypeScript 타입 에러 확인
npm run lint              # ESLint 검사
npm run build             # 프로덕션 빌드 테스트
npm run dev              # 개발 서버 실행
```

### Step 3: 브라우저에서 테스트

**홈 페이지**:
```
http://localhost:3000
```
- [ ] Header/Footer 렌더링 확인
- [ ] 다크모드 토글 작동 확인
- [ ] 포스트 카드 표시 (API 연동)
- [ ] 카테고리 섹션 표시

**포스트 상세 페이지**:
```
http://localhost:3000/post/{slug}
```
- [ ] 포스트 제목, 내용, 메타데이터 표시
- [ ] AdSense 유닛 3개 표시 (실제 광고는 로컬에서 안 보임)
- [ ] 댓글 섹션 표시

**카테고리 페이지**:
```
http://localhost:3000/{category-slug}
예: http://localhost:3000/stock-analysis
```
- [ ] 해당 카테고리의 포스트만 필터링되어 표시

**검색 페이지**:
```
http://localhost:3000/search?q=keyword
```
- [ ] 검색 결과 필터링 확인

**관리자 페이지**:
```
http://localhost:3000/admin
```
- [ ] 로그인 필요 (login 페이지로 리다이렉트)
- [ ] 로그인 후 대시보드 표시
- [ ] 포스트 관리, AI 로그, 스케줄, AdSense, 설정 메뉴

---

## API 엔드포인트 맵핑

### 공개 API (JWT 불필요)

| Frontend 함수 | Backend 엔드포인트 | 쿼리 파라미터 |
|---|---|---|
| `getPosts()` | `GET /posts/published` | `page`, `limit`, `search`, `category`, `tag`, `sort` |
| `getPostBySlug(slug)` | `GET /posts/published/:slug` | - |
| `getCategories()` | `GET /categories` | - |
| `getTags()` | `GET /tags` | - |
| `login(email, password)` | `POST /auth/login` | - |

### 관리자 API (JWT 필수)

| Frontend 함수 | Backend 엔드포인트 | 쿼리 파라미터 |
|---|---|---|
| `getAdminPosts()` | `GET /posts` | `page`, `limit`, `search`, `category`, `tag`, `sort`, `is_published` |
| `createPost(data)` | `POST /posts` | - |
| `updatePost(id, data)` | `PUT /posts/:id` | - |
| `deletePost(id)` | `DELETE /posts/:id` | - |

---

## ⚠️ 주의사항

### 1. Backend 마이그레이션 필수
```bash
cd backend
npm run typeorm migration:run
# 또는 yarn typeorm migration:run
```

### 2. 쿼리 파라미터 변경
- Frontend: `sortBy` → Backend: `sort`
- Frontend: `category` (slug) → Backend: 자동으로 ID로 변환
- Frontend: `tag` (slug) → Backend: 자동으로 ID로 변환

### 3. 응답 형식 변경
- `getPostBySlug()`: 이제 `Post` 객체를 직접 반환 (ApiResponse 래퍼 없음)

### 4. 환경 변수
**개발 환경 (`.env.local`)**:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADSENSE_ID=ca-pub-3811219422484638
```

**프로덕션 (Vercel - `.env.production`)**:
```
NEXT_PUBLIC_API_URL=https://api.usstockstory.com
NEXT_PUBLIC_SITE_URL=https://usstockstory.com
NEXT_PUBLIC_ADSENSE_ID=ca-pub-3811219422484638
```

---

## 🚀 배포 체크리스트

### Vercel 배포 (Frontend)
- [ ] Git 저장소에 커밋
- [ ] Vercel CLI 설치: `npm install -g vercel`
- [ ] `vercel` 명령어로 배포 시작
- [ ] 환경 변수 설정 (Dashboard → Settings → Environment Variables)
- [ ] 도메인 연결 (usstockstory.com)

### Railway 배포 (Backend)
- [ ] Railway 계정 생성
- [ ] MySQL 데이터베이스 생성
- [ ] NestJS 서비스 배포
- [ ] 마이그레이션 실행: `npm run typeorm migration:run`
- [ ] 시드 데이터 생성: `npm run seed`

### Cloudflare CDN (선택사항)
- [ ] Cloudflare에 도메인 추가
- [ ] DNS 레코드 설정
- [ ] SSL/TLS 활성화

---

## 📋 다음 단계 (Week 3)

1. ✅ Frontend ↔ Backend 통합 완료
2. ⏳ **n8n 자동화 워크플로우 설정**
   - [ ] 08:00 프리마켓 브리핑
   - [ ] 14:00 심층분석
   - [ ] 22:00 마감 리캡
3. ⏳ **배포 (Vercel + Railway + Cloudflare)**
4. ⏳ **모니터링 및 최적화**

---

## 문제 해결

### Q: "Cannot find module 'dompurify'"
**A**: 다음을 실행하세요:
```bash
npm install dompurify isomorphic-dompurify
npm install --save-dev @types/dompurify
```

### Q: "API 500 에러"
**A**: Backend 콘솔을 확인하세요:
```bash
# Backend 터미널
npm run start:dev
# 에러 로그 확인
```

### Q: "포스트가 안 보임"
**A**: 다음을 확인하세요:
1. Backend에서 포스트가 실제로 생성되었는지
2. `is_published = true` 인지 확인
3. `.env.local`의 `NEXT_PUBLIC_API_URL` 확인

### Q: "로그인이 안 됨"
**A**: 다음을 확인하세요:
1. Backend의 `auth` 엔드포인트가 작동하는지 테스트:
   ```bash
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password"}'
   ```
2. JWT 토큰이 localStorage에 저장되는지 확인 (개발자 도구 → Application → Local Storage)

---

## 참고 문서

- `DEPLOYMENT.md` - 배포 상세 가이드
- `frontend/README.md` - Frontend 프로젝트 개요
- `backend/README.md` - Backend 프로젝트 개요
