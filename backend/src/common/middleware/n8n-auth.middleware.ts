import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * n8n 내부 API 보안 미들웨어
 * X-N8N-Secret 헤더를 검증합니다.
 *
 * 사용:
 * app.use('/api/internal', N8nAuthMiddleware)
 */
@Injectable()
export class N8nAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const n8nSecret = req.headers['x-n8n-secret'] as string;

    // 환경 변수에서 비밀키 가져오기
    const expectedSecret = process.env.N8N_SECRET_KEY;

    if (!expectedSecret) {
      console.warn(
        '⚠️  N8N_SECRET_KEY 환경 변수가 설정되지 않았습니다. 본 환경에서는 n8n API 검증이 비활성화됩니다.',
      );

      // 개발 환경: 경고만 표시하고 진행
      if (process.env.NODE_ENV === 'development') {
        console.warn('💡 개발 환경이므로 x-n8n-secret 헤더 검증을 건너뜹니다.');
        return next();
      }

      // 운영 환경: 실패
      throw new UnauthorizedException(
        'N8N_SECRET_KEY가 구성되지 않았습니다.',
      );
    }

    // 헤더 검증
    if (!n8nSecret) {
      throw new UnauthorizedException(
        'x-n8n-secret 헤더가 필요합니다. (n8n 내부 API)',
      );
    }

    if (n8nSecret !== expectedSecret) {
      console.error(
        `⚠️  n8n 인증 실패: 잘못된 비밀키 (IP: ${req.ip})`,
      );
      throw new UnauthorizedException(
        'x-n8n-secret 헤더 값이 올바르지 않습니다.',
      );
    }

    // 요청 객체에 n8n 플래그 추가
    (req as any).isN8nRequest = true;

    next();
  }
}
