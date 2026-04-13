# Auth 모듈

사용자 인증 시스템을 관리하는 모듈입니다.

## 주요 기능

- ✅ 회원가입 (Register)
- ✅ 로그인 (Login) - JWT 토큰 발급
- ✅ 토큰 갱신 (Refresh)
- ✅ 현재 사용자 정보 조회 (Me)
- ✅ JWT 검증 (JwtGuard)

## API 엔드포인트

### POST /api/auth/register
회원가입 API

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password_min_8chars",
  "name": "사용자명"
}
```

**Response (201):**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "name": "사용자명",
  "role": "editor"
}
```

---

### POST /api/auth/login
로그인 API

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password_min_8chars"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "사용자명",
    "role": "editor"
  }
}
```

---

### POST /api/auth/refresh
토큰 갱신 API (JWT 토큰 필요)

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### GET /api/auth/me
현재 사용자 정보 조회 (JWT 토큰 필요)

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "name": "사용자명",
  "role": "editor"
}
```

---

## 파일 구조

```
auth/
├── entities/
│   └── user.entity.ts         # User 엔티티
├── dto/
│   ├── login.dto.ts           # Login DTO
│   └── register.dto.ts        # Register DTO
├── strategies/
│   └── jwt.strategy.ts        # JWT 전략
├── guards/
│   └── jwt.guard.ts           # JWT Guard
├── auth.service.ts            # 인증 비즈니스 로직
├── auth.controller.ts         # API 엔드포인트
├── auth.module.ts             # Auth 모듈
└── README.md                  # 이 파일
```

## 다른 모듈에서 사용

```typescript
import { JwtGuard } from '@/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Get('protected-route')
protectedRoute(@Request() req) {
  // req.user.userId 사용 가능
}
```

## 보안 고려사항

- ✅ 비밀번호는 bcryptjs로 해싱됨
- ✅ JWT 토큰으로 인증 구현
- ✅ Access Token (7일) + Refresh Token (30일)
- ✅ 마지막 로그인 시간 기록
- ✅ 이메일 중복 검증

## 추후 개선 사항

- [ ] 비밀번호 재설정 이메일 발송
- [ ] 이메일 인증 (Verification)
- [ ] 소셜 로그인 (OAuth)
- [ ] 2FA (2-Factor Authentication)
- [ ] 로그인 히스토리 기록
