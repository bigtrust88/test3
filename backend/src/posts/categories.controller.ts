import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: '카테고리 전체 조회' })
  async findAll() {
    const data = await this.postsService.findAllCategories();
    return { data, pagination: { total: data.length } };
  }

  @UseGuards(JwtGuard)
  @Post('seed')
  @ApiBearerAuth()
  @ApiOperation({ summary: '카테고리 slug 초기화 (한국어→영어)' })
  async seed() {
    const results = await this.postsService.seedCategories();
    return { results };
  }
}
