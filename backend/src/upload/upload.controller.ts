import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  @Post('image')
  @ApiOperation({ summary: '이미지 R2 업로드' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('파일이 없습니다');

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('JPG, PNG, WEBP, GIF만 업로드 가능합니다');
    }

    const ext = file.originalname.split('.').pop();
    const key = `images/${uuidv4()}.${ext}`;

    const s3 = new AWS.S3({
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      region: 'auto',
      signatureVersion: 'v4',
    });

    await s3.upload({
      Bucket: process.env.R2_BUCKET || 'bigtrust-thumbnails',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();

    const url = `${process.env.R2_PUBLIC_URL}/${key}`;
    return { url };
  }
}
