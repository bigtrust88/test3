import { Injectable, BadRequestException } from '@nestjs/common';
// import { Canvas } from 'skia-canvas';
// @ts-ignore
// import { registerFont } from 'skia-canvas';
import * as path from 'path';
import * as fs from 'fs';

export interface ThumbnailInput {
  headline: string;
  subtext: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  tags: string[];
  category_slug: string;
  trigger_type: 'morning' | 'afternoon' | 'evening';
}

export interface ThumbnailOutput {
  imageBuffer: Buffer;
  imagePath: string;
  width: number;
  height: number;
}

@Injectable()
export class ThumbnailService {
  private readonly CANVAS_WIDTH = 1200;
  private readonly CANVAS_HEIGHT = 630;
  private fontsRegistered = false;

  constructor() {
    this.registerFonts();
  }

  /**
   * 폰트 등록 (Pretendard) - disabled, module is disabled in app.module.ts
   */
  private registerFonts() {
    // Font registration skipped - ThumbnailModule is disabled
    this.fontsRegistered = true;
  }

  /**
   * 썸네일 생성 메인 메서드 - disabled, module is disabled in app.module.ts
   */
  async generate(input: ThumbnailInput): Promise<ThumbnailOutput> {
    // 입력 검증
    this.validateInput(input);

    // Canvas generation skipped - ThumbnailModule is disabled
    // Return placeholder response
    return {
      imageBuffer: Buffer.alloc(0),
      imagePath: `thumbnails/${Date.now()}-${input.trigger_type}.png`,
      width: this.CANVAS_WIDTH,
      height: this.CANVAS_HEIGHT,
    };
  }

  /**
   * 배경 그리기 (시간대별 테마)
   */
  private drawBackground(
    ctx: any,
    sentiment: string,
    trigger_type: string,
  ) {
    // 기본 배경색
    const colors = {
      morning: '#0F172A',
      afternoon: '#1E293B',
      evening: '#0F172A',
    };

    const bgColor = colors[trigger_type] || colors.morning;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // 그라디언트 오버레이 (우측 하단)
    const accentColors = {
      bullish: { r: 16, g: 185, b: 129 },     // Green
      bearish: { r: 239, g: 68, b: 68 },      // Red
      neutral: { r: 59, g: 130, b: 246 },     // Blue
    };

    const accent = accentColors[sentiment] || accentColors.neutral;
    const gradient = ctx.createRadialGradient(
      this.CANVAS_WIDTH * 0.8,
      this.CANVAS_HEIGHT * 0.8,
      0,
      this.CANVAS_WIDTH * 0.8,
      this.CANVAS_HEIGHT * 0.8,
      this.CANVAS_HEIGHT,
    );

    gradient.addColorStop(
      0,
      `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.15)`,
    );
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
  private drawLogo(ctx: any, trigger_type: string) {
    const icons = {
      morning: '🌅',
      afternoon: '📊',
      evening: '🌙',
    };

    const icon = icons[trigger_type] || '📈';

    // 아이콘
    ctx.font = '32px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText(icon, this.CANVAS_WIDTH - 100, 65);

    // 로고 텍스트
    ctx.font = 'bold 22px Pretendard, Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText('USStockStory', this.CANVAS_WIDTH - 55, 65);
  }

  /**
   * 카테고리 Badge 그리기
   */
  private drawBadge(
    ctx: any,
    category_slug: string,
    trigger_type: string,
  ) {
    const badgeColors = {
      morning: '#3B82F6',
      afternoon: '#10B981',
      evening: '#FBBF24',
    };

    const badgeLabels = {
      morning: '🌅 PRE-MARKET',
      afternoon: '📊 심층분석',
      evening: '🌙 마감 리캡',
    };

    const badgeColor = badgeColors[trigger_type] || badgeColors.morning;
    const badgeLabel = badgeLabels[trigger_type] || 'NEWS';

    const badgeX = 48;
    const badgeY = 40;
    const badgeWidth = 150;
    const badgeHeight = 40;
    const borderRadius = 8;

    // Badge 배경
    ctx.fillStyle = badgeColor;
    this.roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, borderRadius);
    ctx.fill();

    // Badge 텍스트
    ctx.font = '600 20px Pretendard, Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeLabel, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
  }

  /**
   * 메인 제목 그리기
   */
  private drawHeadline(ctx: any, headline: string) {
    ctx.font = 'bold 56px Pretendard, Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const maxWidth = this.CANVAS_WIDTH - 96;
    const lineHeight = 72; // 56px * 1.3

    const lines = this.wrapText(ctx, headline, maxWidth);

    lines.slice(0, 2).forEach((line, index) => {
      ctx.fillText(line, 48, 140 + index * lineHeight);
    });
  }

  /**
   * 서브텍스트 그리기
   */
  private drawSubtext(ctx: any, subtext: string) {
    ctx.font = '400 32px Pretendard, Arial';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const maxWidth = this.CANVAS_WIDTH - 96;
    const lines = this.wrapText(ctx, subtext, maxWidth);

    if (lines.length > 0) {
      ctx.fillText(lines[0], 48, 320);
    }
  }

  /**
   * 하단 구분선
   */
  private drawDivider(ctx: any) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.CANVAS_HEIGHT - 100);
    ctx.lineTo(this.CANVAS_WIDTH, this.CANVAS_HEIGHT - 100);
    ctx.stroke();
  }

  /**
   * 태그 + 날짜 그리기
   */
  private drawFooter(ctx: any, tags: string[]) {
    const footerY = this.CANVAS_HEIGHT - 48;

    // 태그 (좌측)
    ctx.font = '400 20px Pretendard, Arial';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

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
   * 텍스트 래핑
   */
  private wrapText(
    ctx: any,
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
    ctx: any,
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
   * 입력 검증
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

  /**
   * 시간대 결정 (현재 시간 기반)
   */
  getTriggerType(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();

    if (hour >= 8 && hour < 14) {
      return 'morning';
    } else if (hour >= 14 && hour < 22) {
      return 'afternoon';
    } else {
      return 'evening';
    }
  }

  /**
   * Sentiment 색상 매핑
   */
  getSentimentColor(sentiment?: string): string {
    const colors = {
      bullish: '#10B981',
      bearish: '#EF4444',
      neutral: '#3B82F6',
    };

    return colors[sentiment] || colors.neutral;
  }
}
