# n8n Cloud 빠른 시작 가이드

## 1. n8n Cloud 계정 생성
- [n8n.io](https://n8n.io) → "Get Started"
- 무료 플랜 선택

## 2. Credentials 설정

### Anthropic API Credential
1. **Credentials** → **"+ New"**
2. **Anthropic** 선택
3. **API Key**: `sk-ant-xxxxx` (Claude API 키)
4. **Save**

## 3. 3개 워크플로우 생성

각 워크플로우는 동일한 구조를 사용합니다.

### 워크플로우 이름
- `01-morning-briefing` (08:00 KST)
- `02-afternoon-analysis` (14:00 KST)
- `03-evening-recap` (22:00 KST)

### 각 워크플로우의 구성 (자세한 내용은 `n8n-workflows/README.md` 참고)

1. **Schedule Trigger** → 정해진 시간
2. **HTTP Request** → AI Log 생성 (`POST /api/ai-logs/internal/create`)
3. **HTTP Request** → RSS 뉴스 크롤링
4. **Function** → 뉴스 파싱
5. **HTTP Request** → Claude API 호출
6. **Function** → 응답 파싱
7. **HTTP Request** → 포스트 발행 (`POST /api/posts/internal/publish`)
8. **HTTP Request** → ISR 재검증 (`POST /api/revalidate`)
9. **HTTP Request** → Discord 알림
10. **HTTP Request** → AI Log 업데이트 (`PUT /api/ai-logs/internal/:id`)

## 4. 필요한 정보

설정할 때 필요한 정보들:

```
Backend URL: https://api.usstockstory.com
N8N_SECRET_KEY: [Railway의 N8N_SECRET_KEY와 동일]
ANTHROPIC_API_KEY: sk-ant-xxxxx
Frontend URL: https://usstockstory.com
REVALIDATE_SECRET: [Railway의 REVALIDATE_SECRET과 동일]
DISCORD_WEBHOOK_URL: https://discord.com/api/webhooks/xxxxx (선택사항)
```

## 5. 테스트 방법

각 워크플로우를 생성한 후:

1. Schedule Trigger를 **Manual**로 변경 (테스트용)
2. **"Activate"** 클릭
3. **"Execute Workflow"** 버튼 클릭
4. 포스트가 발행되는지 확인

## 6. 프로덕션 배포

테스트 완료 후:

1. Schedule Trigger를 **Cron 표현식**으로 변경
   - Morning: `0 23 * * *` (UTC 23:00 = KST 08:00)
   - Afternoon: `0 5 * * *` (UTC 05:00 = KST 14:00)
   - Evening: `0 13 * * *` (UTC 13:00 = KST 22:00)
2. **"Activate"** 클릭
3. 자동 실행 시작

## 주의사항

- n8n Cloud 무료 플랜: 월 5000 실행 (충분함)
- 3개 워크플로우 × 30일 = 90 실행 (여유 있음)
- 자세한 구성은 `n8n-workflows/README.md` 참고
