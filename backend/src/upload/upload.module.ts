import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';

@Module({
  imports: [MulterModule.register({ storage: undefined })],
  controllers: [UploadController],
})
export class UploadModule {}
