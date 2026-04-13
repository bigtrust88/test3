import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AiLogEntity } from './entities/ai-log.entity';
import { CreateAiLogDto } from './dto/create-ai-log.dto';
import { UpdateAiLogDto } from './dto/update-ai-log.dto';

@Injectable()
export class AiLogsService {
  constructor(
    @InjectRepository(AiLogEntity)
    private readonly aiLogRepository: Repository<AiLogEntity>,
  ) {}

  /**
   * AI 로그 생성
   * n8n 실행 시작 시점에 호출
   */
  async create(createAiLogDto: CreateAiLogDto) {
    // 중복 실행 ID 확인
    const existing = await this.aiLogRepository.findOne({
      where: { n8n_execution_id: createAiLogDto.n8n_execution_id },
    });

    if (existing) {
      throw new BadRequestException(
        '이미 존재하는 n8n 실행 ID입니다. (중복 실행 방지)',
      );
    }

    const log = this.aiLogRepository.create({
      id: uuidv4(),
      ...createAiLogDto,
      status: 'pending',
      is_success: false,
      trigger_time: new Date(),
    });

    await this.aiLogRepository.save(log);
    return log;
  }

  /**
   * AI 로그 조회
   */
  async findById(id: string) {
    const log = await this.aiLogRepository.findOne({
      where: { id },
      relations: ['post'],
    });

    if (!log) {
      throw new NotFoundException('AI 로그를 찾을 수 없습니다');
    }

    return log;
  }

  /**
   * n8n 실행 ID로 로그 조회
   */
  async findByExecutionId(n8n_execution_id: string) {
    const log = await this.aiLogRepository.findOne({
      where: { n8n_execution_id },
      relations: ['post'],
    });

    if (!log) {
      throw new NotFoundException('해당 실행 ID의 로그를 찾을 수 없습니다');
    }

    return log;
  }

  /**
   * 모든 AI 로그 조회 (페이지네이션)
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await this.aiLogRepository.findAndCount({
      relations: ['post'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 오늘 실행 현황 조회
   */
  async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await this.aiLogRepository.find({
      where: {
        created_at: Between(today, tomorrow),
      },
      relations: ['post'],
    });

    const stats = {
      total: logs.length,
      success: logs.filter((l) => l.is_success).length,
      failed: logs.filter((l) => !l.is_success).length,
      thumbnailGenerated: logs.filter((l) => l.thumbnail_generated).length,
      byTriggerType: {
        morning: logs.filter((l) => l.trigger_type === 'morning').length,
        afternoon: logs.filter((l) => l.trigger_type === 'afternoon').length,
        evening: logs.filter((l) => l.trigger_type === 'evening').length,
      },
      totalTokens: {
        prompt: logs.reduce((sum, l) => sum + l.claude_prompt_tokens, 0),
        completion: logs.reduce((sum, l) => sum + l.claude_completion_tokens, 0),
      },
    };

    return { logs, stats };
  }

  /**
   * 일주일간 실행 현황
   */
  async getWeeklyStats() {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const logs = await this.aiLogRepository.find({
      where: {
        created_at: Between(weekAgo, today),
      },
    });

    // 날짜별로 그룹화
    const byDate: { [key: string]: AiLogEntity[] } = {};
    logs.forEach((log) => {
      const date = log.created_at.toISOString().split('T')[0];
      if (!byDate[date]) {
        byDate[date] = [];
      }
      byDate[date].push(log);
    });

    const stats = Object.entries(byDate).map(([date, dayLogs]) => ({
      date,
      total: dayLogs.length,
      success: dayLogs.filter((l) => l.is_success).length,
      failed: dayLogs.filter((l) => !l.is_success).length,
      successRate: `${((dayLogs.filter((l) => l.is_success).length / dayLogs.length) * 100).toFixed(1)}%`,
    }));

    return stats;
  }

  /**
   * AI 로그 업데이트 (결과 저장)
   * n8n 실행 완료 후 호출
   */
  async update(id: string, updateAiLogDto: UpdateAiLogDto) {
    const log = await this.findById(id);

    // 상태 업데이트 시 is_success 자동 설정
    if (updateAiLogDto.status === 'success') {
      updateAiLogDto.is_success = true;
    } else if (updateAiLogDto.status === 'failed') {
      updateAiLogDto.is_success = false;
    }

    Object.assign(log, updateAiLogDto);
    await this.aiLogRepository.save(log);

    return this.findById(id);
  }

  /**
   * 실패한 로그 조회
   */
  async findFailures(limit: number = 10) {
    const failures = await this.aiLogRepository.find({
      where: { is_success: false },
      relations: ['post'],
      order: { created_at: 'DESC' },
      take: limit,
    });

    return failures;
  }

  /**
   * AI 로그 통계 (월간)
   */
  async getMonthlyStats(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const logs = await this.aiLogRepository.find({
      where: {
        created_at: Between(startDate, endDate),
      },
    });

    const stats = {
      year,
      month,
      totalRuns: logs.length,
      successfulRuns: logs.filter((l) => l.is_success).length,
      failedRuns: logs.filter((l) => !l.is_success).length,
      successRate: logs.length > 0
        ? `${((logs.filter((l) => l.is_success).length / logs.length) * 100).toFixed(1)}%`
        : '0%',
      totalTokens: {
        prompt: logs.reduce((sum, l) => sum + l.claude_prompt_tokens, 0),
        completion: logs.reduce((sum, l) => sum + l.claude_completion_tokens, 0),
      },
      estimatedCost: {
        claude: (
          (logs.reduce((sum, l) => sum + l.claude_prompt_tokens, 0) * 0.0008 +
            logs.reduce((sum, l) => sum + l.claude_completion_tokens, 0) * 0.0024) /
          1000
        ).toFixed(2),
        totalWithBannerbear: (
          (logs.reduce((sum, l) => sum + l.claude_prompt_tokens, 0) * 0.0008 +
            logs.reduce((sum, l) => sum + l.claude_completion_tokens, 0) * 0.0024) /
            1000 +
          49
        ).toFixed(2),
      },
    };

    return stats;
  }
}
