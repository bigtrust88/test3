import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  @Get('check')
  checkEnv() {
    return {
      R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ? '✅ 설정됨' : '❌ 없음',
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? '✅ 설정됨' : '❌ 없음',
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? '✅ 설정됨' : '❌ 없음',
      R2_BUCKET: process.env.R2_BUCKET || '❌ 없음',
      R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || '❌ 없음',
    };
  }

  @UseGuards(JwtGuard)
  @Post('image')
  @ApiBearerAuth()
  @ApiOperation({ summary: '이미지 R2 업로드' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('파일이 없습니다');

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('JPG, PNG, WEBP, GIF만 업로드 가능합니다');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('파일 내용이 비어있습니다');
    }

    const r2AccountId = process.env.R2_ACCOUNT_ID;
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
    const r2Secret = process.env.R2_SECRET_ACCESS_KEY;
    const r2Bucket = process.env.R2_BUCKET || 'bigtrust-thumbnails';
    const r2PublicUrl = process.env.R2_PUBLIC_URL;

    if (!r2AccountId || !r2AccessKey || !r2Secret || !r2PublicUrl) {
      console.warn('⚠️ R2 환경 변수가 설정되지 않았습니다');
      return {
        url: null,
        message: 'R2 스토리지가 설정되지 않았습니다. 이미지 URL을 직접 입력해주세요.',
        instruction: '관리자: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL 설정 필요',
      };
    }

    const ext = file.originalname.split('.').pop() || 'jpg';
    const key = `images/${uuidv4()}.${ext}`;

    const s3 = new AWS.S3({
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      accessKeyId: r2AccessKey,
      secretAccessKey: r2Secret,
      region: 'auto',
      signatureVersion: 'v4',
    });

    try {
      await s3.upload({
        Bucket: r2Bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }).promise();
    } catch (err) {
      console.error('R2 upload error:', err.message, err.code);
      throw new InternalServerErrorException(`R2 업로드 실패: ${err.message}`);
    }

    const url = `${r2PublicUrl}/${key}`;
    return { url };
  }
}
