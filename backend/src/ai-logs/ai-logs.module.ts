import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiLogsService } from './ai-logs.service';
import { AiLogsController } from './ai-logs.controller';
import { AiLogEntity } from './entities/ai-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiLogEntity])],
  providers: [AiLogsService],
  controllers: [AiLogsController],
  exports: [AiLogsService],
})
export class AiLogsModule {}
