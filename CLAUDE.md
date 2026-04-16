# Claude Code Project Guidelines

> 이 파일은 이 프로젝트에서 Claude가 따라야 할 작업 방식과 명령어를 정의합니다.

---

## 언어 규칙

- 사용자와의 모든 대화는 **한글**로 진행
- 코드, 에러 메시지, 기술 용어는 영문 유지
- 설명과 지침은 한글로 작성

---

## 커스텀 명령어

### `/posting` - 포스팅 생성

**목적**: 영어 포스팅(본문 + 썸네일)을 표준화된 방식으로 생성

**사용 형식**:
```
/posting

주제: [종목명 또는 주제]
타입: [stock-analysis | market-trend | earnings | etf-analysis | investment-strategy]
썸네일 헤드라인: [최대 44자, 구체적 숫자 또는 감정 포함]
썸네일 서브텍스트: [최대 30자, 핵심 수치]
감정: [bullish | bearish | neutral]
주요 키워드: [keyword1, keyword2, keyword3, ...]
```

**실행 단계**:

1. **본문 작성** (1000–1500 단어, 영문)
   - E-E-A-T 원칙 준수 (@POSTING_STANDARDS.md 참고)
   - 최소 2개 출처 인용 (FactSet, Bloomberg, company IR, Reuters, CNBC)
   - 최소 1개 데이터 테이블 (Key Metrics)
   - 마지막에 disclaimer 필수 포함

2. **본문 이미지 추가**
   - Unsplash에서 관련 이미지 찾기
   - **R2에 업로드** (또는 Unsplash stable URL 사용: `ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80`)
   - Markdown 형식: `![description](R2-or-unsplash-url)`
   - content_md에 정확히 **1개만** 삽입 (보통 데이터 테이블 이후)

3. **Canvas 썸네일 자동 생성**
   - NestJS ThumbnailService 호출
   - 입력값: thumbnail_headline, thumbnail_subtext, sentiment, trigger_type, highlight_keywords
   - 출력: cover_image_url (자동으로 R2에 저장)
   - (@THUMBNAIL_GENERATION-CANVAS.md 참고)

4. **메타데이터 준비**
   - title: 60자 이내, 티커 포함
   - excerpt: 160자 이내, 구체적 수치 포함
   - category_id: UUID (stock-analysis, investment-strategy 등)
   - tag_ids: 3–5개 tag의 UUID 배열
   - is_published: true
   - reading_time_mins: 4–6분

5. **API 업로드**
   - POST /api/posts (CreatePostDto)
   - 필수 필드: title, slug, excerpt, content_md, content_html (marked 사용), category_id, tag_ids
   - thumbnail 관련: thumbnail_headline, thumbnail_subtext, sentiment, trigger_type, highlight_keywords

6. **최종 검증**
   - API 응답에서 cover_image_url이 생성되었는지 확인
   - 웹사이트 (/post/{slug})에서 썸네일과 본문 이미지 모두 표시되는지 확인
   - "완료했습니다"라고 보고하기 전에 **반드시** 시각적 검증 완료

---

## 예시

### 예 1: TSMC 실적 분석
```
/posting

주제: TSMC Q1 2024 Earnings Analysis
타입: stock-analysis
썸네일 헤드라인: TSMC Q1: Record Revenue from AI Demand
썸네일 서브텍스트: NT$686.7B revenue, 57.9% gross margin
감정: bullish
주요 키워드: TSMC, semiconductors, AI, earnings
```

### 예 2: 투자 전략
```
/posting

주제: Semiconductor Portfolio Strategy for AI Era
타입: investment-strategy
썸네일 헤드라인: The 3-Pillar Semiconductor Framework
썸네일 서브텍스트: TSMC, NVIDIA, Broadcom allocation model
감정: bullish
주요 키워드: semiconductors, investment, portfolio, AI
```

---

## 중요 규칙 (절대 위반 금지)

### 이미지 관련
✅ **해야 할 것**:
- Canvas로 썸네일 자동 생성 (NestJS ThumbnailService)
- 본문 이미지는 R2에 업로드하거나 stable Unsplash URL 사용
- 모든 이미지 URL은 안정적인 형식 검증 후 사용

❌ **하면 안 될 것**:
- Unsplash 일반 사진으로 썸네일 대체
- 썸네일 cover_image_url 수동 설정 (Canvas가 자동 생성)
- 이미지 URL 검증 없이 업로드
- "완료했습니다"라고 보고 후 실제로는 이미지가 안 보이는 상황

### 포스팅 검증
✅ **반드시 확인**:
1. 브라우저에서 모든 이미지 URL 직접 확인 (로드되는지)
2. API 응답에서 cover_image_url, content_html 확인
3. 웹사이트에서 실제 표시 확인

❌ **절대 금지**:
- "파일에 있으니까 괜찮겠지" 식의 추측
- 검증 없이 "완료" 보고
- 같은 이미지 문제 반복

### 메모리 관리
- 실수가 발생하면 **즉시 memory/ 디렉토리에 feedback_*.md로 저장**
- 포스팅 관련 모든 규칙을 memory/ 파일로 기록
- 나중에 같은 실수를 반복하지 않기 위해 명확하게 작성

---

## 참고 문서

- `POSTING_STANDARDS.md` - 포스팅 콘텐츠 기준 (E-E-A-T, 구조, 메타데이터)
- `THUMBNAIL_GENERATION-CANVAS.md` - Canvas 기반 썸네일 생성 기술
- `memory/` - 과거 실수와 규칙들 (MEMORY.md 인덱스 참고)
- `backend/.env.production` - API 자격증명 및 R2 설정

---

## 프로젝트 정보

- **목표**: 영어 기반 미국주식 투자 블로그 (Google 검색 대응)
- **배포**: Vercel (frontend), Railway (backend API)
- **이미지**: Cloudflare R2 (썸네일 + 본문 이미지)
- **포스팅**: NestJS API → MySQL → Next.js SSR
- **자동화**: n8n + Claude API (미래 확장용)

---

**마지막 업데이트**: 2026-04-16
