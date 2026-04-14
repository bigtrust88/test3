import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // ===== 공개 API (JWT 불필요) =====

  @Get('published')
  @ApiOperation({ summary: '공개 포스트 조회 (페이지네이션)' })
  async findPublished(@Query() query: QueryPostsDto) {
    return this.postsService.findPublished(query);
  }

  @Get('published/:slug')
  @ApiOperation({ summary: '공개 포스트 조회 (슬러그)' })
  async findPublishedBySlug(@Param('slug') slug: string) {
    return this.postsService.findPublishedBySlug(slug);
  }

  // ===== 관리자 API (JWT 필요) =====

  @UseGuards(JwtGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '모든 포스트 조회 (관리자용)' })
  async findAll(@Query() query: QueryPostsDto) {
    return this.postsService.findAll(query);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '포스트 조회 (ID)' })
  async findById(@Param('id') id: string) {
    return this.postsService.findById(id);
  }

  @UseGuards(JwtGuard)
  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '포스트 생성' })
  async create(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    return this.postsService.create(createPostDto, req.user?.userId);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '포스트 수정' })
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '포스트 삭제 (소프트)' })
  async delete(@Param('id') id: string) {
    await this.postsService.delete(id);
  }

  // ===== 내부 API (n8n용, X-N8N-Secret 헤더로 인증) =====

  @Post('internal/publish')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'n8n용 AI 포스트 자동 발행' })
  async createFromAI(
    @Body()
    payload: {
      title: string;
      slug: string;
      excerpt: string;
      content_md: string;
      content_html?: string;
      category_id?: string;
      category_slug?: string;
      tags: string[];
      ai_source_urls?: string[];
      reading_time_mins?: number;
    },
  ) {
    return this.postsService.createFromAI(
      payload.title,
      payload.slug,
      payload.excerpt,
      payload.content_md,
      payload.content_html || null,
      payload.category_slug || payload.category_id || '시장동향',
      payload.tags,
      payload.ai_source_urls || [],
      payload.reading_time_mins || 5,
    );
  }
}
