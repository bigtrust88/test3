# US Stock Story Frontend

Next.js 14 기반 미국 주식 블로그 프론트엔드

## 시작하기

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드
```bash
npm run build
npm start
```

### 린트 체크
```bash
npm run lint
npm run lint:fix
```

## 프로젝트 구조

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈 페이지
│   └── globals.css        # 전역 스타일
├── components/            # React 컴포넌트
│   ├── Header.tsx         # 헤더
│   ├── Navigation.tsx     # 네비게이션
│   ├── Footer.tsx         # 푸터
│   └── ui/                # UI 컴포넌트
├── lib/                   # 유틸리티
│   ├── api.ts            # API 클라이언트
│   ├── types.ts          # TypeScript 타입
│   └── constants.ts      # 상수
├── hooks/                # Custom Hooks
│   └── useAuth.ts        # 인증 훅
├── public/               # 정적 파일
└── package.json         # 의존성
```

## 기술 스택

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** (다크모드 지원)
- **next-themes** (테마 전환)
- **SWR** (데이터 페칭)

## 주요 기능

### 현재 (Day 1)
- ✅ 프로젝트 초기화
- ✅ 다크/라이트 모드
- ✅ Header, Navigation, Footer
- ✅ API 클라이언트 설정
- ✅ TypeScript 타입 정의

### 예정 (Day 2-5)
- [ ] 홈페이지 포스트 그리드
- [ ] 포스트 상세 페이지
- [ ] 카테고리 필터링
- [ ] 관리자 대시보드
- [ ] 마켓 위젯
- [ ] SEO 최적화

## 환경 변수

`.env.local` 파일 생성:

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AdSense
NEXT_PUBLIC_ADSENSE_ID=ca-pub-3811219422484638
```

## 개발 가이드

### 컴포넌트 작성
- 함수형 컴포넌트 사용
- TypeScript 필수
- Props 타입 명시
- 재사용 가능하도록 설계

### 스타일링
- Tailwind CSS 사용
- 다크모드 고려 (`dark:` prefix)
- 반응형 디자인 필수

### API 호출
- `lib/api.ts`의 함수 사용
- JWT 토큰 자동 관리
- 에러 처리 필수

## 배포

### Vercel
```bash
npm install -g vercel
vercel
```

### 환경 변수 설정 (Vercel)
1. Vercel 대시보드 접속
2. 프로젝트 설정 → Environment Variables
3. 필요한 환경 변수 추가

## 참고 문서

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
