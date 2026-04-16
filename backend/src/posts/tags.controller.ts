import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  async findAll() {
    const data = await this.postsService.findAllTags();
    return { data, pagination: { total: data.length } };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a tag by ID (admin only)' })
  async deleteTag(@Param('id') id: string) {
    return this.postsService.deleteTag(id);
  }
}
