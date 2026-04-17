# THUMBNAIL_GENERATION-8.md
# Canvas 썸네일 생성 명세

## 개요

포스트 썸네일은 **Node.js Canvas 합성 방식**으로 생성한다.

- Unsplash에서 포스트 주제와 관련된 배경 사진을 다운로드
- Node.js `canvas` 패키지로 텍스트/배지/오버레이를 합성
- 결과 PNG를 R2에 업로드 → `cover_image_url` 저장
- **규격**: 1200 × 630px (16:9 OG Image 표준)

---

## 1. 배경 이미지 선택 (Unsplash)

포스트 주제에 맞는 Unsplash 사진을 선택한다.

**URL 형식:**
```
https://images.unsplash.com/photo-{PHOTO_ID}?w=1200&q=80&fm=jpg
```

**포스트별 배경 이미지 (승인된 목록):**

| 카테고리 | Unsplash Photo ID | 설명 |
|----------|-------------------|------|
| semiconductor | `photo-1518770660439-4636190af475` | 회로기판/칩 |
| datacenter | `photo-1558494949-ef010cbdcc31` | 서버/네트워크 |
| gpu | `photo-1526374965328-7f61d4dc18c5` | GPU/그래픽 |
| finance | `photo-1590283603385-17ffb3a7f29f` | 상승 주식 차트 (녹색) |
| bank | `photo-1486406146926-c627a92ad1ab` | 금융 빌딩 |
| streaming | `photo-1522869635100-9f4c5e86aa37` | 스트리밍/미디어 |
| technology | `photo-1581091226825-a6a2a5aee158` | 테크/랩탑 |
| electric-vehicle | `photo-1593941707882-a5bba14938c7` | 전기차 |
| cloud | `photo-1544197150-b99a580bb7a8` | 클라우드 |
| market-overview | `photo-1611974789855-9c2a0a7236a3` | ❌ 사용 금지 (하락 차트) |

사용 전 브라우저에서 URL이 실제로 로드되는지 반드시 확인한다.

**❌ 절대 사용 금지 (2가지 규칙)**:

1. **하락 차트 이미지 금지**: 차트가 하락하는 모양(우하향 곡선, 빨간 하락 캔들 지배적, 폭락 그래프)이 포함된 이미지는 sentiment와 무관하게 사용하지 않는다. `photo-1611974789855-9c2a0a7236a3`은 하락 차트이므로 절대 사용 금지.

2. **동일 이미지 중복 사용 금지**: 기존 포스트 전체에서 사용된 적 없는 사진을 우선 사용하되, **포스트 주제에 맞는 사진**을 선택한다.
   - 코드가 미사용 사진 목록(+설명)을 Claude에게 전달
   - Claude는 그 목록 안에서 포스트 주제/컨셉에 가장 어울리는 사진을 선택
   - 같은 실행(run) 내 3개 포스트의 썸네일 배경(`bg_photo_id`)은 반드시 서로 다른 사진
   - 썸네일 배경(`bg_photo_id`)과 본문 이미지(`body_photo_id`)도 서로 다른 사진 사용

---

## 2. Canvas 합성 레이어 구조

```
┌─────────────────────────────────────────┐ 1200px
│ [1] Unsplash 배경 사진                   │
│ [2] 어두운 그라디언트 오버레이            │ 630px
│ [3] 감정(sentiment) 컬러 글로우          │
│ ┌──────────┐              USStockStory  │
│ │ PRE-MARKET│  [4] Badge  [5] Logo      │
│ └──────────┘                            │
│                                         │
│  [6] 메인 제목 (최대 2줄, 60px Bold)     │
│  TSMC Q1: AI Chip Boom Drives Record    │
│                                         │
│  [7] 서브텍스트 (30px, 회색)             │
│  NT$686.7B revenue, +9.8% YoY          │
│                                         │
│ ───────────────────────────────────── │
│  [8] 구분선                              │
│  #TSMC  #AI  #Q1 2024      04/17/2026  │
│  [9] 태그 + 날짜 푸터                    │
└─────────────────────────────────────────┘
```

---

## 3. 디자인 명세

### 컬러

| 용도 | Hex |
|------|-----|
| 오버레이 상단 | `rgba(0,0,0,0.55)` |
| 오버레이 하단 | `rgba(0,0,0,0.80)` |
| Bullish 글로우 | `#10B981` (green) |
| Bearish 글로우 | `#EF4444` (red) |
| Neutral 글로우 | `#3B82F6` (blue) |
| 제목 텍스트 | `#FFFFFF` |
| 서브텍스트 | `#CBD5E1` |
| 태그/날짜 | `#94A3B8` |
| 구분선 | `rgba(255,255,255,0.25)` |

### Badge 색상 및 라벨 (이모지 없이 — Canvas에서 깨짐)

| trigger_type | 배경색 | 라벨 텍스트 |
|---|---|---|
| morning | `#3B82F6` | `PRE-MARKET` |
| afternoon | `#10B981` | `ANALYSIS` |
| evening | `#FBBF24` | `MARKET CLOSE` |

### 타이포그래피

| 요소 | 폰트 | 크기 | 색상 |
|------|------|------|------|
| Badge 텍스트 | Arial Bold | 20px | #FFFFFF |
| 로고 | Arial Bold | 24px | #FFFFFF |
| 제목 | Arial Bold | 60px | #FFFFFF |
| 서브텍스트 | Arial | 30px | #CBD5E1 |
| 태그/날짜 | Arial | 20px | #94A3B8 |

### 레이아웃 좌표

| 요소 | 위치 |
|------|------|
| Badge | top: 36px, left: 48px, height: 40px |
| 로고 | top: 56px (middle), right: 48px |
| 제목 1줄 | top: 150px, left: 48px |
| 제목 2줄 | top: 228px (150 + 78), left: 48px |
| 서브텍스트 | top: 340px, left: 48px |
| 구분선 | y: CANVAS_HEIGHT - 100 |
| 태그/날짜 | y: CANVAS_HEIGHT - 52 (middle) |

---

## 4. 구현 코드 (generate_real_thumbnails.js)

```javascript
const https = require('https');
const http = require('http');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const FormData = require('form-data');

const TOKEN = fs.readFileSync('C:/Users/User/AppData/Local/Temp/token.txt', 'utf8').trim();
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;

// 1. Unsplash 배경 이미지 다운로드
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

// 2. R2 업로드 (백엔드 API 경유)
function uploadViaAPI(imageBuffer, filename) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', imageBuffer, { filename, contentType: 'image/png' });
    const options = {
      hostname: 'api.bigtrust.site',
      path: '/api/upload/image',
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + TOKEN, ...form.getHeaders() }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({ error: data }); } });
    });
    req.on('error', reject);
    form.pipe(req);
  });
}

// 3. Canvas 합성
async function composeThumbnail(bgImageUrl, post) {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext('2d');

  // 배경 이미지
  const imgBuffer = await downloadImage(bgImageUrl);
  const bgImage = await loadImage(imgBuffer);
  ctx.drawImage(bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 어두운 그라디언트 오버레이
  const overlay = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  overlay.addColorStop(0, 'rgba(0,0,0,0.55)');
  overlay.addColorStop(0.5, 'rgba(0,0,0,0.65)');
  overlay.addColorStop(1, 'rgba(0,0,0,0.80)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Sentiment 글로우 (좌하단)
  const accentColor = { bullish: '#10B981', bearish: '#EF4444', neutral: '#3B82F6' }[post.sentiment] || '#3B82F6';
  const glow = ctx.createRadialGradient(0, CANVAS_HEIGHT, 0, 0, CANVAS_HEIGHT, 500);
  glow.addColorStop(0, `${accentColor}33`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Badge (좌상단) — 이모지 없이 순수 텍스트
  const badgeLabels = { morning: 'PRE-MARKET', afternoon: 'ANALYSIS', evening: 'MARKET CLOSE' };
  const badgeColors = { morning: '#3B82F6', afternoon: '#10B981', evening: '#FBBF24' };
  const badgeLabel = badgeLabels[post.trigger_type] || 'NEWS';
  const badgeColor = badgeColors[post.trigger_type] || '#3B82F6';
  ctx.font = 'bold 20px Arial';
  const badgeTextW = ctx.measureText(badgeLabel).width;
  ctx.fillStyle = badgeColor;
  ctx.fillRect(48, 36, badgeTextW + 32, 40);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeLabel, 48 + 16, 56);

  // 로고 (우상단)
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('USStockStory', CANVAS_WIDTH - 48, 56);

  // 메인 제목 (최대 2줄)
  ctx.font = 'bold 60px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const words = post.headline.split(' ');
  const maxW = CANVAS_WIDTH - 96;
  let lines = [], cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  lines.slice(0, 2).forEach((line, i) => ctx.fillText(line, 48, 150 + i * 78));

  // 서브텍스트
  ctx.font = '30px Arial';
  ctx.fillStyle = '#CBD5E1';
  ctx.textBaseline = 'top';
  ctx.fillText(post.subtext, 48, 340);

  // 구분선
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(48, CANVAS_HEIGHT - 100);
  ctx.lineTo(CANVAS_WIDTH - 48, CANVAS_HEIGHT - 100);
  ctx.stroke();

  // 태그 + 날짜 (하단)
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(post.tags.slice(0, 3).map(t => '#' + t).join('   '), 48, CANVAS_HEIGHT - 52);
  ctx.textAlign = 'right';
  const d = new Date();
  ctx.fillText(`${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`, CANVAS_WIDTH - 48, CANVAS_HEIGHT - 52);

  return canvas.toBuffer('image/png');
}
```

---

## 5. 실행 흐름

```
1. 포스트 주제에 맞는 Unsplash photo ID 선택
2. composeThumbnail(unsplashUrl, postData) 호출
   → 배경 다운로드 → Canvas 합성 → PNG 버퍼 반환
3. uploadViaAPI(buffer, filename) 호출
   → POST /api/upload/image (multipart FormData)
   → 응답: { url: "https://pub-xxxx.r2.dev/images/xxx.png" }
4. PUT /api/posts/{id} 로 cover_image_url 업데이트
```

---

## 6. 본문 이미지 (content_md)

썸네일과 별도로, 본문 마크다운에 1개의 이미지를 삽입한다.

- **형식**: `![alt text](https://images.unsplash.com/photo-{ID}?w=1200&q=80&fm=jpg)`
- **위치**: 데이터 테이블 이후, 분석 섹션 앞
- 썸네일 배경과 동일하거나 보완적인 사진 사용 가능

---

## 7. 주의사항

- Badge 텍스트에 **이모지 금지** (Canvas에서 픽셀 아트로 깨짐)
- Unsplash URL은 반드시 `?w=1200&q=80&fm=jpg` 형식 사용
- `cover_image_url`에 Unsplash URL 직접 사용 금지 → R2 URL만 허용
- `canvas` npm 패키지는 `/TEST3` 루트에 설치: `npm install canvas form-data`
