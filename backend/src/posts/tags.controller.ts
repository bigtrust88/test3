import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PostsService } from './posts.service';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: '태그 전체 조회' })
  async findAll() {
    const data = await this.postsService.findAllTags();
    return { data, pagination: { total: data.length } };
  }
}
