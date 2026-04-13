import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  getHealth(): { status: string; timestamp: string; uptime: number } {
    const uptime = Date.now() - this.startTime;
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime,
    };
  }
}
