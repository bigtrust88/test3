# Railway 환경 변수 설정 가이드

Railway 대시보드 → **Variables** 탭에서 다음을 입력하세요.

## 필수 환경 변수

### 기본 설정
```
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
```

### 데이터베이스
```
DATABASE_URL=[자동 생성됨 - MySQL 플러그인 추가 후]
```

### JWT 인증
```
JWT_SECRET=your-jwt-secret-at-least-32-characters-long-change-this
JWT_EXPIRATION=7d
```

### n8n 인증
```
N8N_SECRET_KEY=your-n8n-secret-key-at-least-32-characters-long-change-this
```

### Claude API
```
ANTHROPIC_API_KEY=sk-ant-[YOUR_ACTUAL_API_KEY]
```

### Frontend 연동
```
FRONTEND_URL=https://usstockstory.com
REVALIDATE_SECRET=your-isr-revalidation-secret-at-least-32-chars-change-this
```

## 단계별 설정

### Step 1: MySQL 플러그인 추가
1. Railway 프로젝트 대시보드
2. 우측 상단 **"+ Add"** 클릭
3. **Marketplace** → **MySQL** → **Add Plugin**
4. 자동으로 `DATABASE_URL`이 Variables에 생성됨

### Step 2: 환경 변수 입력
위의 필수 환경 변수들을 **Variables** 탭에 입력

### Step 3: 배포 확인
- **Deployments** 탭에서 배포 진행 상황 확인
- **Logs** 탭에서 실시간 로그 확인
- 배포 완료 후 자동으로 `npm run migration:run && npm run start` 실행

## 주의사항

⚠️ `JWT_SECRET`, `N8N_SECRET_KEY`, `REVALIDATE_SECRET`은 **32글자 이상의 난수**로 설정하세요.
예: `abc123def456ghi789jkl012mno345pqr`

🔒 실제 배포 시 강력한 비밀키로 변경하세요!
