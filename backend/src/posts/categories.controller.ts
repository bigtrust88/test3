import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PostsService } from './posts.service';

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
}
