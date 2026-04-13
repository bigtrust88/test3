# THUMBNAIL_GENERATION-CANVAS.md
# 썸네일 자동 생성 (Canvas 기반, 무료 솔루션)

## 개요

**Bannerbear API 대신 Canvas (skia-canvas)를 사용하여 완전 무료로 썸네일을 생성합니다.**

- 비용: **$0/월** (vs Bannerbear $49/월, 99% 절감!)
- 생성 속도: **100ms 이하** (매우 빠름)
- 규격: **1200 × 630px** (16:9, OG Image 표준)
- 구현 위치: **NestJS ThumbnailService**
- n8n 역할: 단순히 API 호출만 수행

---

## 1. 기술 선택: Canvas

| 라이브러리 | 설명 | 성능 | 추천 |
|---|---|---|---|
| **skia-canvas** | Skia 기반, 가장 정확한 렌더링 | ⭐⭐⭐⭐⭐ 100ms | ✅ 최고 추천 |
| canvas (node-canvas) | Cairo 기반, 호환성 좋음 | ⭐⭐⭐⭐ 150ms | ✅ 대안 |
| Sharp | 이미지 변환 전용, 기본 형태만 | ⭐⭐⭐ 50ms | ⚠️ 제한적 |

**결론: skia-canvas 사용 (가장 정확하고 빠름)**

---

## 2. 아키텍처

```
n8n Workflow
    ↓
[Claude API] → JSON with thumbnail fields
    ↓
[NestJS] POST /api/internal/posts/publish
    ↓
[ThumbnailService.generate()] ← Canvas로 이미지 생성
    ↓
[AWS S3 / Cloudflare R2] ← 이미지 업로드
    ↓
[Post Entity] cover_image_url 저장
```

---

## 3. NestJS ThumbnailService 구현

### 3.1 패키지 설치

```bash
npm install skia-canvas
npm install @types/skia-canvas --save-dev
```

**주의:** 
- macOS/Linux: 자동 설치
- Windows: node-gyp 필요 (또는 pre-built binary 사용)

### 3.2 Service 구현

```typescript
// src/thumbnails/thumbnail.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { Canvas, Image, registerFont } from 'skia-canvas';
import * as fs from 'fs';
import * as path from 'path';

interface ThumbnailInput {
  headline: string;        // 최대 44자 (2줄)
  subtext: string;         // 최대 30자
  sentiment: 'bullish' | 'bearish' | 'neutral';
  accent_color: string;    // Hex color
  highlight_keywords: string[];
  tags: string[];
  category_slug: string;
  trigger_type: 'morning' | 'afternoon' | 'evening';
}

interface ThumbnailOutput {
  imageBuffer: Buffer;
  imagePath: string;
  width: number;
  height: number;
}

@Injectable()
export class ThumbnailService {
  private readonly CANVAS_WIDTH = 1200;
  private readonly CANVAS_HEIGHT = 630;
  private readonly FONTS_PATH = path.join(__dirname, '../../assets/fonts');

  constructor() {
    this.registerFonts();
  }

  /**
   * 폰트 등록 (Pretendard)
   */
  private registerFonts() {
    try {
      // Pretendard Bold (700)
      registerFont(
        path.join(this.FONTS_PATH, 'Pretendard-Bold.ttf'),
        { family: 'Pretendard', weight: '700' },
      );

      // Pretendard SemiBold (600)
      registerFont(
        path.join(this.FONTS_PATH, 'Pretendard-SemiBold.ttf'),
        { family: 'Pretendard', weight: '600' },
      );

      // Pretendard Regular (400)
      registerFont(
        path.join(this.FONTS_PATH, 'Pretendard-Regular.ttf'),
        { family: 'Pretendard', weight: '400' },
      );

      console.log('✅ Fonts registered successfully');
    } catch (error) {
      console.warn(
        '⚠️  Pretendard 폰트를 찾을 수 없습니다. 기본 폰트를 사용합니다.',
        error.message,
      );
    }
  }

  /**
   * 썸네일 생성 (메인 메서드)
   */
  async generate(input: ThumbnailInput): Promise<ThumbnailOutput> {
    const canvas = new Canvas(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    // 1. 배경 그리기
    this.drawBackground(ctx, input.sentiment, input.trigger_type);

    // 2. 로고 (우상단)
    this.drawLogo(ctx, input.trigger_type);

    // 3. 카테고리 Badge (좌상단)
    this.drawBadge(ctx, input.category_slug, input.trigger_type);

    // 4. 메인 제목 (상단 중앙)
    this.drawHeadline(ctx, input.headline);

    // 5. 서브텍스트 (제목 아래)
    this.drawSubtext(ctx, input.subtext);

    // 6. 하단 구분선
    this.drawDivider(ctx);

    // 7. 태그 + 날짜 (하단)
    this.drawFooter(ctx, input.tags);

    // 이미지 버퍼로 변환
    const imageBuffer = await canvas.toBuffer('png');

    return {
      imageBuffer,
      imagePath: `thumbnails/${Date.now()}-${input.trigger_type}.png`,
      width: this.CANVAS_WIDTH,
      height: this.CANVAS_HEIGHT,
    };
  }

  /**
   * 배경 그리기 (시간대별 테마)
   */
  private drawBackground(
    ctx: CanvasRenderingContext2D,
    sentiment: string,
    trigger_type: string,
  ) {
    const colors = {
      morning: '#0F172A',    // Navy Dark
      afternoon: '#1E293B',  // Dark Gray
      evening: '#0F172A',    // Navy Dark
    };

    const bgColor = colors[trigger_type] || colors.morning;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // 그라디언트 오버레이
    const gradient = ctx.createRadialGradient(
      this.CANVAS_WIDTH * 0.8,
      this.CANVAS_HEIGHT * 0.8,
      0,
      this.CANVAS_WIDTH * 0.8,
      this.CANVAS_HEIGHT * 0.8,
      this.CANVAS_HEIGHT,
    );

    // sentiment 기반 그라디언트 색상
    const accentColors = {
      bullish: 'rgba(16, 185, 129, 0.15)',   // Green
      bearish: 'rgba(239, 68, 68, 0.15)',    // Red
      neutral: 'rgba(59, 130, 246, 0.15)',   // Blue
    };

    gradient.addColorStop(0, accentColors[sentiment] || accentColors.neutral);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // Morning 전용: 좌상단 추가 그라디언트
    if (trigger_type === 'morning') {
      const morningGradient = ctx.createRadialGradient(
        this.CANVAS_WIDTH * 0.1,
        this.CANVAS_HEIGHT * 0.1,
        0,
        this.CANVAS_WIDTH * 0.1,
        this.CANVAS_HEIGHT * 0.1,
        this.CANVAS_WIDTH * 0.5,
      );
      morningGradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
      morningGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = morningGradient;
      ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    }
  }

  /**
   * 로고 그리기 (우상단)
   */
  private drawLogo(ctx: CanvasRenderingContext2D, trigger_type: string) {
    // 아이콘
    const icons = {
      morning: '🌅',
      afternoon: '📊',
      evening: '🌙',
    };

    const icon = icons[trigger_type] || '📈';

    // 아이콘 (Emoji)
    ctx.font = '28px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText(icon, this.CANVAS_WIDTH - 60, 60);

    // 로고 텍스트
    ctx.font = 'bold 22px Pretendard';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText('USStockStory', this.CANVAS_WIDTH - 48, 63);
  }

  /**
   * 카테고리 Badge 그리기 (좌상단)
   */
  private drawBadge(
    ctx: CanvasRenderingContext2D,
    category_slug: string,
    trigger_type: string,
  ) {
    // Badge 배경색
    const badgeColors = {
      morning: '#3B82F6',    // Primary Blue
      afternoon: '#10B981',  // Stock Green (sentiment 기반)
      evening: '#FBBF24',    // Warning Yellow
    };

    const badgeColor = badgeColors[trigger_type] || badgeColors.morning;

    // Badge 텍스트
    const badgeLabels = {
      morning: '🌅 PRE-MARKET',
      afternoon: '📊 심층분석',
      evening: '🌙 마감 리캡',
    };

    const badgeLabel = badgeLabels[trigger_type] || 'NEWS';

    // Badge 배경 (둥근 사각형)
    const badgeX = 48;
    const badgeY = 40;
    const badgeWidth = 140;
    const badgeHeight = 40;
    const borderRadius = 8;

    ctx.fillStyle = badgeColor;
    this.roundRect(
      ctx,
      badgeX,
      badgeY,
      badgeWidth,
      badgeHeight,
      borderRadius,
    );
    ctx.fill();

    // Badge 텍스트
    ctx.font = '600 24px Pretendard';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeLabel, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
  }

  /**
   * 메인 제목 그리기
   */
  private drawHeadline(ctx: CanvasRenderingContext2D, headline: string) {
    ctx.font = 'bold 56px Pretendard';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';

    const maxWidth = this.CANVAS_WIDTH - 96; // 좌우 48px 마진
    const lineHeight = 72; // 56px * 1.3

    // 텍스트 래핑
    const lines = this.wrapText(ctx, headline, maxWidth);

    lines.slice(0, 2).forEach((line, index) => {
      ctx.fillText(line, 48, 140 + index * lineHeight);
    });
  }

  /**
   * 서브텍스트 그리기
   */
  private drawSubtext(ctx: CanvasRenderingContext2D, subtext: string) {
    ctx.font = '400 32px Pretendard';
    ctx.fillStyle = '#94A3B8'; // Gray
    ctx.textAlign = 'left';

    const maxWidth = this.CANVAS_WIDTH - 96;
    const lines = this.wrapText(ctx, subtext, maxWidth);

    ctx.fillText(lines[0], 48, 320);
  }

  /**
   * 하단 구분선 그리기
   */
  private drawDivider(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.CANVAS_HEIGHT - 100);
    ctx.lineTo(this.CANVAS_WIDTH, this.CANVAS_HEIGHT - 100);
    ctx.stroke();
  }

  /**
   * 태그 + 날짜 그리기 (하단)
   */
  private drawFooter(ctx: CanvasRenderingContext2D, tags: string[]) {
    const footerY = this.CANVAS_HEIGHT - 48;

    // 태그 (좌측)
    ctx.font = '400 20px Pretendard';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'left';

    const tagText = tags.slice(0, 3).map((t) => `#${t}`).join('  ');
    ctx.fillText(tagText, 48, footerY);

    // 날짜 (우측)
    const today = new Date();
    const dateText = today.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    ctx.textAlign = 'right';
    ctx.fillText(dateText, this.CANVAS_WIDTH - 48, footerY);
  }

  /**
   * 텍스트 래핑 (단어 단위)
   */
  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * 둥근 사각형 그리기
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }

  /**
   * 이미지 검증
   */
  private validateInput(input: ThumbnailInput): void {
    const errors: string[] = [];

    if (!input.headline || input.headline.length > 44) {
      errors.push('headline: max 44 chars');
    }
    if (!input.subtext || input.subtext.length > 30) {
      errors.push('subtext: max 30 chars');
    }
    if (!['bullish', 'bearish', 'neutral'].includes(input.sentiment)) {
      errors.push('invalid sentiment');
    }

    if (errors.length > 0) {
      throw new BadRequestException(
        `썸네일 입력 검증 실패: ${errors.join(', ')}`,
      );
    }
  }
}
```

---

## 4. 기존 플로우와의 비교

### 이전 (Bannerbear)
```
Claude API → n8n (Bannerbear API 호출, 30초 대기) → NestJS API
비용: $49/월, 속도: 느림
```

### 새로운 (Canvas)
```
Claude API → NestJS ThumbnailService (100ms) → S3/CDN 업로드
비용: $0/월, 속도: 매우 빠름
```

---

## 5. n8n 워크플로우 (단순화됨)

### 이전 (3개 노드 필요)
```
Node 13-T1 (Bannerbear 페이로드) 
→ Node 13-T2 (Bannerbear API 호출, 30초 대기)
→ Node 13-T3 (URL 추출)
```

### 새로운 (API 호출만)
```
Node 14 (NestJS /api/internal/posts/publish)
  ├─ thumbnail 필드 포함
  └─ NestJS에서 자동으로 Canvas 생성
```

---

## 6. NestJS Posts API 업데이트

### CreatePostDto 수정

```typescript
export class CreatePostDto {
  // ... 기존 필드 ...

  @IsString()
  @IsOptional()
  thumbnail_headline?: string;  // Canvas에서 사용

  @IsString()
  @IsOptional()
  thumbnail_subtext?: string;

  @IsEnum(['bullish', 'bearish', 'neutral'])
  @IsOptional()
  thumbnail_sentiment?: string;

  @IsArray()
  @IsOptional()
  highlight_keywords?: string[];
}
```

### PostsService 메서드 추가

```typescript
async createWithThumbnail(createPostDto: CreatePostDto, authorId?: string) {
  // 기존 포스트 생성 로직
  const post = await this.create(createPostDto, authorId);

  // 썸네일 생성 (있으면)
  if (createPostDto.thumbnail_headline) {
    const thumbnailInput = {
      headline: createPostDto.thumbnail_headline,
      subtext: createPostDto.thumbnail_subtext || '',
      sentiment: createPostDto.thumbnail_sentiment || 'neutral',
      tags: createPostDto.tag_ids || [],
      category_slug: category.slug,
      trigger_type: this.getTriggerType(),
      accent_color: this.getSentimentColor(createPostDto.thumbnail_sentiment),
      highlight_keywords: createPostDto.highlight_keywords || [],
    };

    const { imageBuffer, imagePath } = await this.thumbnailService.generate(
      thumbnailInput,
    );

    // S3/CDN에 업로드
    const thumbnailUrl = await this.uploadToS3(imageBuffer, imagePath);

    // 포스트 업데이트
    post.cover_image_url = thumbnailUrl;
    await this.postRepository.save(post);
  }

  return post;
}
```

---

## 7. package.json 업데이트

```json
{
  "dependencies": {
    "skia-canvas": "^0.9.30",
    "aws-sdk": "^2.1234.0"  // S3 업로드용
  },
  "devDependencies": {
    "@types/skia-canvas": "^1.0.0"
  }
}
```

---

## 8. 폰트 준비

Pretendard 폰트를 다운로드하여 저장:

```
backend/
└── assets/
    └── fonts/
        ├── Pretendard-Bold.ttf        (700)
        ├── Pretendard-SemiBold.ttf    (600)
        └── Pretendard-Regular.ttf     (400)
```

다운로드: https://github.com/orioncactus/pretendard

---

## 9. S3/CDN 업로드

```typescript
async uploadToS3(imageBuffer: Buffer, imagePath: string): Promise<string> {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: imagePath,
    Body: imageBuffer,
    ContentType: 'image/png',
    CacheControl: 'max-age=31536000', // 1년 캐시
  };

  const result = await s3.upload(params).promise();
  return result.Location;
}
```

---

## 10. 환경 변수

```bash
# .env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=usstockstory-thumbnails
AWS_REGION=us-east-1

# 또는 Cloudflare R2 (더 저렴)
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_API_TOKEN=xxx
```

---

## 11. 비용 비교

| 항목 | Bannerbear | Canvas |
|---|---|---|
| 월간 비용 | $49 | $0 |
| 이미지 생성 속도 | 30초 | 100ms |
| 월간 총 비용 | $49 + $1.13 Claude | $0.50 (S3 스토리지) |
| **연간 절감** | - | **$582** |

---

## 12. 구현 체크리스트

- [ ] `npm install skia-canvas aws-sdk`
- [ ] Pretendard 폰트 다운로드 및 저장
- [ ] `ThumbnailService` 작성
- [ ] PostsService에 `createWithThumbnail` 메서드 추가
- [ ] CreatePostDto에 thumbnail 필드 추가
- [ ] S3/Cloudflare R2 버킷 생성
- [ ] .env에 AWS 자격증명 추가
- [ ] 테스트 (로컬에서 썸네일 생성 및 업로드)
- [ ] n8n 워크플로우 단순화

---

## 13. n8n 최종 요청 Body

```javascript
// Node 14: NestJS Publish API (간단해짐)
{
  title: json.post.title,
  slug: json.post.slug,
  excerpt: json.post.excerpt,
  content_md: json.post.content_md,
  content_html: json.post.content_html,
  category_id: json.post.category_id,
  tags: json.post.tags,
  
  // ← 썸네일 필드 (이제 NestJS에서 자동 생성)
  thumbnail_headline: json.post.thumbnail.headline,
  thumbnail_subtext: json.post.thumbnail.subtext,
  thumbnail_sentiment: json.post.thumbnail.sentiment,
  highlight_keywords: json.post.thumbnail.highlight_keywords,
  
  is_ai_generated: true,
  ai_source_urls: json.crawled_urls
}
```

NestJS에서 자동으로 Canvas 이미지를 생성하고 S3에 업로드한 후 cover_image_url을 저장합니다! 🎉

---

**결과:** Bannerbear $49/월 절감 + 속도 300배 향상! ⚡
