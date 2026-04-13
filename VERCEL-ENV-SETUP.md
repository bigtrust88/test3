# Vercel 환경 변수 설정 가이드

Vercel 프로젝트 **Settings** → **Environment Variables** 탭에서 다음을 입력하세요.

## 필수 환경 변수

### Backend API 연동
```
NEXT_PUBLIC_API_URL=https://api.usstockstory.com
```

### 사이트 설정
```
NEXT_PUBLIC_SITE_URL=https://usstockstory.com
```

### AdSense
```
NEXT_PUBLIC_ADSENSE_ID=ca-pub-3811219422484638
```

### ISR 재검증 비밀키
```
REVALIDATE_SECRET=your-isr-revalidation-secret-at-least-32-chars-change-this
```

⚠️ **중요**: `REVALIDATE_SECRET`은 **Railway의 값과 동일**해야 합니다!

## 단계별 설정

### Step 1: Vercel 프로젝트 대시보드 접속
1. vercel.com의 프로젝트 대시보드
2. **Settings** 탭 클릭

### Step 2: 환경 변수 추가
1. **Environment Variables** 섹션
2. **"Add New Variable"** 클릭
3. 위의 4개 변수를 모두 입력
4. **Save** 클릭

### Step 3: 배포 확인
1. **Deployments** 탭에서 배포 상태 확인
2. 배포 완료 후 우측 **"Visit"**으로 사이트 접속 확인

## 도메인 연동 (선택사항)

### 커스텀 도메인 추가
1. **Settings** → **Domains**
2. **"Add"** 클릭
3. 도메인 입력: `usstockstory.com`
4. DNS 설정 지시사항 따르기

## 주의사항

🔒 **REVALIDATE_SECRET**:
- Railway의 `REVALIDATE_SECRET`과 **반드시 동일**해야 함
- 32글자 이상의 난수로 설정

📝 `NEXT_PUBLIC_*` 접두사:
- 이 변수들은 클라이언트 코드에 노출되므로 API 키가 아닌 공개 정보만 포함
- 민감한 정보는 포함하지 말 것
