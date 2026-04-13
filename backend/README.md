# Stock Blog Backend

미국주식 블로그 자동화 백엔드 - NestJS + TypeORM + MySQL

## 초기 설정

### 1. 환경 설정
```bash
cp .env.example .env.local
# .env.local 파일 수정 (데이터베이스 정보 입력)
```

### 2. 데이터베이스 생성
```bash
mysql -u root -p
CREATE DATABASE stock_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON stock_blog.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 의존성 설치
```bash
npm install
```

### 4. 개발 서버 실행
```bash
npm run start:dev
```

### 5. API 문서 확인
```
http://localhost:3001/api/docs
```

## 주요 파일 구조

```
src/
├── main.ts                 # 애플리케이션 진입점
├── app.module.ts           # Root 모듈
├── app.controller.ts       # 기본 컨트롤러
├── app.service.ts          # 기본 서비스
├── auth/                   # 인증 모듈 (예정)
├── posts/                  # 포스트 모듈 (예정)
├── categories/             # 카테고리 모듈 (예정)
├── common/                 # 공유 유틸리티
└── migrations/             # 데이터베이스 마이그레이션
```

## 마이그레이션 명령어

```bash
# 마이그레이션 파일 생성
npm run migration:generate -- -n CreateUsersTable

# 마이그레이션 실행
npm run migration:run

# 마이그레이션 되돌리기
npm run migration:revert
```

## API 엔드포인트

### 상태 확인
```
GET /api/health
Response: { status: "ok", timestamp: "...", uptime: 123456 }
```

## 다음 작업

- [ ] Auth 모듈 (Day 2)
- [ ] Posts 데이터베이스 설계 (Day 3)
- [ ] Posts API GET (Day 4)
- [ ] Posts API POST/PUT/DELETE (Day 5)

## 개발 노트

- TypeScript strict mode 활성화
- Global Validation Pipe 설정됨
- CORS 활성화됨
- Swagger 문서화 제공
