import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AiLogsService } from './ai-logs.service';
import { CreateAiLogDto } from './dto/create-ai-log.dto';
import { UpdateAiLogDto } from './dto/update-ai-log.dto';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('AI Logs')
@Controller('ai-logs')
export class AiLogsController {
  constructor(private readonly aiLogsService: AiLogsService) {}

  // ===== 관리자 API (JWT 필요) =====

  @UseGuards(JwtGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI 로그 조회 (페이지네이션)' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    if (limit > 100) limit = 100;
    return this.aiLogsService.findAll(page, limit);
  }

  @UseGuards(JwtGuard)
  @Get('today')
  @ApiBearerAuth()
  @ApiOperation({ summary: '오늘 실행 현황 조회' })
  async getTodayStats() {
    return this.aiLogsService.getTodayStats();
  }

  @UseGuards(JwtGuard)
  @Get('weekly')
  @ApiBearerAuth()
  @ApiOperation({ summary: '일주일 실행 현황 조회' })
  async getWeeklyStats() {
    return this.aiLogsService.getWeeklyStats();
  }

  @UseGuards(JwtGuard)
  @Get('monthly/:year/:month')
  @ApiBearerAuth()
  @ApiOperation({ summary: '월간 실행 현황 조회' })
  async getMonthlyStats(
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    if (month < 1 || month > 12) {
      throw new BadRequestException('month는 1~12 사이의 값이어야 합니다');
    }
    return this.aiLogsService.getMonthlyStats(year, month);
  }

  @UseGuards(JwtGuard)
  @Get('failures')
  @ApiBearerAuth()
  @ApiOperation({ summary: '최근 실패 로그 조회' })
  async getFailures(@Query('limit') limit: number = 10) {
    return this.aiLogsService.findFailures(limit);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI 로그 상세 조회' })
  async findById(@Param('id') id: string) {
    return this.aiLogsService.findById(id);
  }

  @UseGuards(JwtGuard)
  @Get('execution/:n8n_execution_id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'n8n 실행 ID로 로그 조회' })
  async findByExecutionId(@Param('n8n_execution_id') n8n_execution_id: string) {
    return this.aiLogsService.findByExecutionId(n8n_execution_id);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI 로그 업데이트 (결과 저장)' })
  async update(@Param('id') id: string, @Body() updateAiLogDto: UpdateAiLogDto) {
    return this.aiLogsService.update(id, updateAiLogDto);
  }

  // ===== 내부 API (n8n용) =====

  @Post('internal/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'n8n 실행 시작 시 로그 생성' })
  async createLog(@Body() createAiLogDto: CreateAiLogDto) {
    return this.aiLogsService.create(createAiLogDto);
  }

  @Put('internal/:id')
  @ApiOperation({ summary: 'n8n 실행 완료 후 로그 업데이트' })
  async updateLog(
    @Param('id') id: string,
    @Body() updateAiLogDto: UpdateAiLogDto,
  ) {
    return this.aiLogsService.update(id, updateAiLogDto);
  }
}
