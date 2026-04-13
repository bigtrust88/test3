# 프로젝트 폴더 구조 및 초기화

## 전체 프로젝트 구조

```
stock-blog/
├── frontend/                    # Next.js 프로젝트
├── backend/                     # NestJS 프로젝트
├── n8n-workflows/               # n8n 워크플로우 정의
├── docs/                        # 문서
└── .github/
    └── workflows/               # GitHub Actions
```

---

## 1. Frontend (Next.js 14)

### 1.1 프로젝트 초기화

```bash
# Next.js 14 프로젝트 생성
npx create-next-app@latest frontend --typescript --tailwind --eslint

# 또는 수동 설정
mkdir frontend && cd frontend
npm init -y
npm install next@14 react@18 react-dom@18
npm install -D tailwindcss postcss autoprefixer typescript
npx tailwindcss init -p
```

### 1.2 폴더 구조

```
frontend/
├── app/
│   ├── layout.tsx                           # Root layout
│   ├── page.tsx                             # 홈 페이지 (/)
│   │
│   ├── (public)/                            # 퍼블릭 페이지 그룹
│   │   ├── layout.tsx                       # 퍼블릭 레이아웃
│   │   ├── page.tsx                         # 홈
│   │   ├── [category]/
│   │   │   ├── page.tsx                     # /[category]
│   │   │   └── layout.tsx
│   │   ├── post/
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx                 # /post/[slug]
│   │   │   │   ├── layout.tsx
│   │   │   │   └── opengraph-image.tsx      # OG 이미지 생성
│   │   │   └── layout.tsx
│   │   ├── tag/
│   │   │   └── [tag]/
│   │   │       └── page.tsx                 # /tag/[tag]
│   │   ├── search/
│   │   │   ├── page.tsx                     # /search
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   │
│   ├── (admin)/                             # 관리자 페이지 그룹
│   │   ├── admin/
│   │   │   ├── layout.tsx                   # 관리자 레이아웃
│   │   │   ├── page.tsx                     # 대시보드
│   │   │   ├── posts/
│   │   │   │   ├── page.tsx                 # 포스트 목록
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx             # 새 포스트
│   │   │   │   ├── [id]/
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx         # 포스트 수정
│   │   │   │   └── layout.tsx
│   │   │   ├── ai-logs/
│   │   │   │   ├── page.tsx                 # AI 로그
│   │   │   │   └── layout.tsx
│   │   │   ├── scheduler/
│   │   │   │   ├── page.tsx                 # 스케줄 관리
│   │   │   │   └── layout.tsx
│   │   │   ├── adsense/
│   │   │   │   ├── page.tsx                 # AdSense 수익
│   │   │   │   └── layout.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx                 # 설정
│   │   │       └── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx                     # 로그인 페이지
│   │   └── layout.tsx
│   │
│   ├── api/                                 # API Routes & Internal
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts                 # NextAuth.js
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── posts/
│   │   │   ├── route.ts                     # GET /api/posts
│   │   │   └── [id]/route.ts
│   │   ├── search/route.ts
│   │   ├── market-data/route.ts             # Yahoo Finance 프록시
│   │   ├── categories/route.ts
│   │   ├── tags/route.ts
│   │   └── revalidate/route.ts              # ISR 재검증
│   │
│   ├── sitemap.ts                           # 동적 사이트맵
│   ├── robots.ts                            # robots.txt
│   └── globals.css                          # 글로벌 스타일
│
├── components/
│   ├── Header.tsx
│   ├── Navigation.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   ├── SearchBar.tsx
│   ├── TagCloud.tsx
│   ├── CategoryFilter.tsx
│   ├── PostCard.tsx
│   ├── PostContent.tsx
│   ├── RelatedPosts.tsx
│   ├── TableOfContents.tsx
│   ├── CommentSection.tsx
│   ├── MarketWidget.tsx
│   ├── LatestPostsGrid.tsx
│   ├── CategorySection.tsx
│   │
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── StatsCard.tsx
│   │   ├── PostsCountCard.tsx
│   │   ├── TrafficChart.tsx
│   │   ├── AIStatsCard.tsx
│   │   ├── LatestExecutions.tsx
│   │   ├── PostsTable.tsx
│   │   ├── PostsToolbar.tsx
│   │   ├── PostForm.tsx
│   │   ├── MarkdownEditor.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── AILogsTable.tsx
│   │   ├── LogDetailModal.tsx
│   │   ├── ScheduleCard.tsx
│   │   ├── TriggerModal.tsx
│   │   ├── RevenueChart.tsx
│   │   └── AdUnitsPerformance.tsx
│   │
│   ├── dashboard/
│   │   ├── PostsCountCard.tsx
│   │   ├── TrafficChart.tsx
│   │   ├── AIStatsCard.tsx
│   │   └── LatestExecutions.tsx
│   │
│   ├── forms/
│   │   ├── PostForm.tsx
│   │   ├── LoginForm.tsx
│   │   └── SubscribeForm.tsx
│   │
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Pagination.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Card.tsx
│   │   ├── Tabs.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Toast.tsx
│   │   └── Tooltip.tsx
│   │
│   └── ads/
│       ├── AdSenseUnit.tsx
│       ├── AdSenseHead.tsx
│       └── AdSenseInArticle.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePost.ts
│   ├── usePosts.ts
│   ├── useSearch.ts
│   ├── useDarkMode.ts
│   ├── useDebounce.ts
│   ├── useFetch.ts
│   ├── useLocalStorage.ts
│   ├── useWindowSize.ts
│   └── useInfiniteScroll.ts
│
├── lib/
│   ├── api.ts                               # API 클라이언트
│   ├── auth.ts                              # 인증 관련
│   ├── markdown.ts                          # 마크다운 처리
│   ├── seo.ts                               # SEO 헬퍼
│   ├── utils.ts                             # 유틸리티 함수
│   ├── constants.ts                         # 상수
│   └── types.ts                             # TypeScript 타입
│
├── contexts/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
│
├── providers/
│   ├── ThemeProvider.tsx                    # next-themes
│   ├── AuthProvider.tsx
│   └── ToastProvider.tsx
│
├── styles/
│   ├── globals.css
│   ├── variables.css                        # CSS 변수
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   ├── og-image.png
│   │   └── ...
│   ├── fonts/
│   │   ├── pretendard/
│   │   └── ...
│   ├── robots.txt
│   └── sitemap.xml
│
├── middleware.ts                            # NextAuth 미들웨어
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── package-lock.json
├── .env.local                               # 환경 변수 (로컬)
├── .env.example                             # 환경 변수 템플릿
├── .eslintrc.json
├── .gitignore
└── README.md
```

### 1.3 package.json 주요 의존성

```json
{
  "name": "stock-blog-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "next-themes": "^0.2.1",
    "@uiw/react-md-editor": "^11.0.0",
    "swr": "^2.2.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "zustand": "^4.4.0",
    "recharts": "^2.10.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

---

## 2. Backend (NestJS)

### 2.1 프로젝트 초기화

```bash
# NestJS CLI 설치
npm i -g @nestjs/cli

# 새 프로젝트 생성
nest new backend

# 또는
npm i @nestjs/common @nestjs/core @nestjs/platform-express
```

### 2.2 폴더 구조

```
backend/
├── src/
│   ├── main.ts                              # 엔트리포인트
│   ├── app.module.ts                        # Root module
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt.guard.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── posts/
│   │   ├── posts.module.ts
│   │   ├── posts.service.ts
│   │   ├── posts.controller.ts
│   │   ├── entities/
│   │   │   └── post.entity.ts
│   │   ├── dto/
│   │   │   ├── create-post.dto.ts
│   │   │   ├── update-post.dto.ts
│   │   │   └── post-query.dto.ts
│   │   └── repositories/
│   │       └── posts.repository.ts
│   │
│   ├── categories/
│   │   ├── categories.module.ts
│   │   ├── categories.service.ts
│   │   ├── categories.controller.ts
│   │   ├── entities/
│   │   │   └── category.entity.ts
│   │   └── dto/
│   │       └── create-category.dto.ts
│   │
│   ├── tags/
│   │   ├── tags.module.ts
│   │   ├── tags.service.ts
│   │   ├── tags.controller.ts
│   │   ├── entities/
│   │   │   └── tag.entity.ts
│   │   └── dto/
│   │       └── create-tag.dto.ts
│   │
│   ├── ai-logs/
│   │   ├── ai-logs.module.ts
│   │   ├── ai-logs.service.ts
│   │   ├── ai-logs.controller.ts
│   │   ├── entities/
│   │   │   └── ai-log.entity.ts
│   │   └── dto/
│   │       ├── create-ai-log.dto.ts
│   │       └── ai-log-query.dto.ts
│   │
│   ├── market-data/
│   │   ├── market-data.module.ts
│   │   ├── market-data.service.ts
│   │   ├── market-data.controller.ts
│   │   ├── dto/
│   │   │   └── market-data.dto.ts
│   │   └── interfaces/
│   │       └── market-index.interface.ts
│   │
│   ├── search/
│   │   ├── search.module.ts
│   │   ├── search.service.ts
│   │   ├── search.controller.ts
│   │   └── dto/
│   │       └── search-query.dto.ts
│   │
│   ├── admin/
│   │   ├── admin.module.ts
│   │   ├── admin.service.ts
│   │   ├── admin.controller.ts
│   │   ├── dashboard/
│   │   │   ├── dashboard.service.ts
│   │   │   └── dashboard.controller.ts
│   │   └── dto/
│   │       └── dashboard-query.dto.ts
│   │
│   ├── internal/
│   │   ├── internal.module.ts
│   │   ├── internal.controller.ts
│   │   ├── internal.service.ts
│   │   ├── guards/
│   │   │   └── shared-secret.guard.ts
│   │   └── dto/
│   │       ├── publish-post.dto.ts
│   │       ├── revalidate.dto.ts
│   │       └── create-ai-log.dto.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── public.decorator.ts
│   │   │   └── throttle.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── middleware/
│   │   │   └── logger.middleware.ts
│   │   ├── guards/
│   │   │   ├── jwt.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── dto/
│   │       ├── pagination.dto.ts
│   │       └── response.dto.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   └── swagger.config.ts
│   │
│   └── utils/
│       ├── markdown.util.ts
│       ├── slug.util.ts
│       └── cache.util.ts
│
├── dist/                                    # 빌드 결과
├── test/                                    # 테스트
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── typeorm/
│   ├── migrations/
│   │   ├── 1681234567890-CreatePostsTable.ts
│   │   ├── 1681234567891-CreateCategoriesTable.ts
│   │   ├── 1681234567892-CreateTagsTable.ts
│   │   └── ...
│   └── seeds/
│       ├── category.seeder.ts
│       ├── user.seeder.ts
│       └── ...
│
├── .env.local                               # 환경 변수
├── .env.example                             # 환경 변수 템플릿
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.build.json
├── README.md
└── .gitignore
```

### 2.3 package.json 주요 의존성

```json
{
  "name": "stock-blog-backend",
  "version": "1.0.0",
  "description": "NestJS backend for stock blog",
  "author": "",
  "license": "MIT",
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "build": "nest build",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "typeorm": "typeorm",
    "migration:generate": "typeorm migration:generate",
    "migration:run": "typeorm migration:run",
    "migration:revert": "typeorm migration:revert",
    "seed": "ts-node ./src/seeding"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/swagger": "^7.1.0",
    "@nestjs/throttler": "^5.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "typeorm": "^0.3.17",
    "mysql2": "^3.6.0",
    "redis": "^4.6.0",
    "marked": "^11.0.0",
    "dompurify": "^3.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@types/marked": "^7.0.0",
    "@types/dompurify": "^3.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 3. N8N 워크플로우

### 3.1 폴더 구조

```
n8n-workflows/
├── workflows/
│   ├── 1-morning-briefing.json              # 08:00 프리마켓
│   ├── 2-afternoon-analysis.json            # 14:00 점심 분석
│   ├── 3-evening-recap.json                 # 22:00 마감 리캡
│   └── README.md                            # 워크플로우 설명
│
├── credentials/
│   ├── anthropic-api.json
│   ├── nestjs-internal.json
│   ├── discord-webhook.json
│   └── telegram-bot.json
│
├── env.example
├── setup.md                                 # n8n 설정 가이드
└── README.md
```

### 3.2 환경 변수 (.env)

```bash
# n8n
N8N_ENCRYPTION_KEY=your-encryption-key
N8N_DB_SQLITE_FILE_NAME=/home/node/n8n-data/n8n.db

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# System Prompts
CLAUDE_SYSTEM_PROMPT_MORNING="..."
CLAUDE_SYSTEM_PROMPT_AFTERNOON="..."
CLAUDE_SYSTEM_PROMPT_EVENING="..."

# NestJS
N8N_SHARED_SECRET=your-shared-secret
NESTJS_API_BASE_URL=https://api.usstockstory.com

# 알림
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=-123456
```

---

## 4. 데이터베이스 마이그레이션

### 4.1 마이그레이션 파일 예시

```bash
# 마이그레이션 생성
npm run typeorm migration:generate -n CreatePostsTable

# 마이그레이션 실행
npm run typeorm migration:run
```

### 4.2 초기 테이블 구조

```typescript
// 1681234567890-CreatePostsTable.ts
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePostsTable1681234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "posts",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "uuid",
            type: "char",
            length: "36",
            isUnique: true,
          },
          {
            name: "title",
            type: "varchar",
            length: "500",
          },
          {
            name: "slug",
            type: "varchar",
            length: "600",
            isUnique: true,
          },
          // ... 나머지 컬럼
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        indices: [
          {
            columnNames: ["is_published", "published_at"],
            isUnique: false,
          },
          // ... 더 많은 인덱스
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("posts");
  }
}
```

---

## 5. 배포 설정

### 5.1 Docker (선택사항)

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### 5.2 GitHub Actions (CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel & Railway

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Frontend to Vercel
        run: |
          npm install -g vercel
          vercel deploy --prod --token ${{ secrets.VERCEL_TOKEN }}
        working-directory: ./frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Backend to Railway
        run: |
          npm install -g @railway/cli
          railway deploy --token ${{ secrets.RAILWAY_TOKEN }}
        working-directory: ./backend
```

---

## 6. 환경 변수 템플릿

### 6.1 Frontend (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL=https://api.usstockstory.com
NEXT_PUBLIC_SITE_URL=https://usstockstory.com

# 인증
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://usstockstory.com

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# AdSense
NEXT_PUBLIC_ADSENSE_ID=ca-pub-3811219422484638
```

### 6.2 Backend (.env.local)

```bash
# 데이터베이스
DATABASE_URL=mysql://user:password@localhost:3306/stock_blog

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# n8n
N8N_SHARED_SECRET=shared-secret-key

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# 포트
PORT=3001
NODE_ENV=development

# 로깅
LOG_LEVEL=debug
```

---

## 7. 초기 설치 및 실행

### 7.1 Frontend 설치

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### 7.2 Backend 설치

```bash
cd backend
npm install
npm run start:dev
# http://localhost:3001
```

### 7.3 Database 초기화

```bash
# MySQL 데이터베이스 생성
mysql -u root -p
CREATE DATABASE stock_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 마이그레이션 실행
cd backend
npm run typeorm migration:run

# 시드 데이터 삽입 (선택사항)
npm run seed
```

---

## 8. Git 구조

### 8.1 .gitignore

```
# 의존성
node_modules/
package-lock.json
yarn.lock

# 빌드
dist/
build/
.next/
out/

# 환경 변수
.env
.env.local
.env.*.local

# 에디터
.vscode/
.idea/
*.swp
*.swo
*.DS_Store

# 로그
*.log
logs/

# 임시
temp/
tmp/

# 캐시
.eslintcache
```

---

## 9. README 파일 템플릿

### 9.1 루트 README.md

```markdown
# 미국주식 블로그 (US Stock Story)

자동화된 AI 기반 미국 주식 분석 블로그입니다.

## 기술 스택

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeORM + MySQL
- **AI**: Claude API (Anthropic)
- **자동화**: n8n
- **배포**: Vercel + Railway + Cloudflare

## 프로젝트 구조

```
stock-blog/
├── frontend/    # Next.js 프로젝트
├── backend/     # NestJS 프로젝트
└── n8n-workflows/  # 자동화 워크플로우
```

## 빠른 시작

### 설치

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

### 실행

```bash
# Frontend (http://localhost:3000)
cd frontend && npm run dev

# Backend (http://localhost:3001)
cd backend && npm run start:dev
```

## 문서

- [설계 문서](./docs/DESIGN.md)
- [API 문서](./backend/README.md)
- [컴포넌트 가이드](./frontend/README.md)
- [n8n 워크플로우](./n8n-workflows/README.md)

## 라이선스

MIT
```

---

## 10. 초기 설정 체크리스트

### 10.1 Pre-Development

- [ ] GitHub 저장소 생성
- [ ] Node.js 버전 확인 (v18+)
- [ ] MySQL 설치 및 실행
- [ ] Redis 설치 (선택사항)
- [ ] Claude API 키 발급
- [ ] Vercel 계정 연결
- [ ] Railway 계정 연결
- [ ] Cloudflare DNS 설정

### 10.2 Development

- [ ] Frontend 프로젝트 생성
- [ ] Backend 프로젝트 생성
- [ ] 환경 변수 파일 생성
- [ ] 데이터베이스 마이그레이션 실행
- [ ] 초기 시드 데이터 삽입
- [ ] n8n 워크플로우 설정
- [ ] 로컬 테스트 완료

### 10.3 Pre-Production

- [ ] 환경 변수 Vercel/Railway에 설정
- [ ] 데이터베이스 백업 설정
- [ ] SSL 인증서 설정
- [ ] 모니터링 설정
- [ ] 로그 수집 설정
- [ ] 프로덕션 배포

---

## 11. 핵심 파일 템플릿

### 11.1 main.ts (Backend)

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Stock Blog API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3001);
  console.log(`Application is running on: http://localhost:${process.env.PORT || 3001}`);
}

bootstrap();
```

### 11.2 next.config.js (Frontend)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'cdn.example.com' },
      { hostname: '*.unsplash.com' },
    ],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};

module.exports = nextConfig;
```
