import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, IsNull, Not } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PostEntity } from './entities/post.entity';
import { CategoryEntity } from './entities/category.entity';
import { TagEntity } from './entities/tag.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { MarkdownUtil } from '@/common/utils';
import { ThumbnailService } from '../thumbnails/thumbnail.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    private readonly thumbnailService: ThumbnailService,
  ) {}

  // 공개 포스트 조회 (페이지네이션)
  async findPublished(query: QueryPostsDto) {
    let { page = 1, limit = 10, category_id, category, tag_id, tag, search, sort } = query;
    const skip = (page - 1) * limit;

    // slug → ID 변환
    if (category && !category_id) {
      const cat = await this.categoryRepository.findOne({ where: { slug: category } });
      if (cat) {
        category_id = cat.id;
      }
    }

    if (tag && !tag_id) {
      const tagEntity = await this.tagRepository.findOne({ where: { slug: tag } });
      if (tagEntity) {
        tag_id = tagEntity.id;
      }
    }

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.is_published = true')
      .andWhere('post.deleted_at IS NULL');

    if (category_id) {
      queryBuilder.andWhere('post.category_id = :category_id', { category_id });
    }

    if (tag_id) {
      queryBuilder
        .innerJoin('post.tags', 'tag_filter', 'tag_filter.id = :tag_id')
        .setParameter('tag_id', tag_id);
    }

    if (search) {
      queryBuilder.andWhere(
        '(post.title LIKE :search OR post.excerpt LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 정렬
    if (sort === 'oldest') {
      queryBuilder.orderBy('post.published_at', 'ASC');
    } else {
      queryBuilder.orderBy('post.published_at', 'DESC');
    }

    const [posts, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // 포스트 상세 조회 (공개)
  async findPublishedBySlug(slug: string) {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.slug = :slug', { slug })
      .andWhere('post.is_published = true')
      .andWhere('post.deleted_at IS NULL')
      .getOne();

    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다');
    }

    return post;
  }

  // 카테고리 전체 조회 (공개)
  async findAllCategories() {
    return this.categoryRepository.find({ order: { name_ko: 'ASC' } });
  }

  // 태그 전체 조회 (공개)
  async findAllTags() {
    return this.tagRepository.find({ order: { name: 'ASC' } });
  }

  // 모든 포스트 조회 (관리자용)
  async findAll(query: QueryPostsDto) {
    let { page = 1, limit = 10, category_id, category, tag_id, tag, search, is_ai_generated, sort } = query;
    const skip = (page - 1) * limit;

    // slug → ID 변환
    if (category && !category_id) {
      const cat = await this.categoryRepository.findOne({ where: { slug: category } });
      if (cat) {
        category_id = cat.id;
      }
    }

    if (tag && !tag_id) {
      const tagEntity = await this.tagRepository.findOne({ where: { slug: tag } });
      if (tagEntity) {
        tag_id = tagEntity.id;
      }
    }

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.author', 'author');

    if (category_id) {
      queryBuilder.andWhere('post.category_id = :category_id', { category_id });
    }

    if (tag_id) {
      queryBuilder
        .innerJoin('post.tags', 'tag_filter', 'tag_filter.id = :tag_id')
        .setParameter('tag_id', tag_id);
    }

    if (search) {
      queryBuilder.andWhere(
        '(post.title LIKE :search OR post.excerpt LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (is_ai_generated !== undefined) {
      queryBuilder.andWhere('post.is_ai_generated = :is_ai_generated', { is_ai_generated });
    }

    if (sort === 'oldest') {
      queryBuilder.orderBy('post.created_at', 'ASC');
    } else {
      queryBuilder.orderBy('post.created_at', 'DESC');
    }

    const [posts, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // 포스트 조회 (ID)
  async findById(id: string) {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.id = :id', { id })
      .getOne();

    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다');
    }

    return post;
  }

  // 포스트 생성
  async create(createPostDto: CreatePostDto, authorId?: string) {
    // 카테고리 확인
    const category = await this.categoryRepository.findOne({
      where: { id: createPostDto.category_id },
    });
    if (!category) {
      throw new BadRequestException('존재하지 않는 카테고리입니다');
    }

    // slug 중복 확인
    const existingPost = await this.postRepository.findOne({
      where: { slug: createPostDto.slug },
    });
    if (existingPost) {
      throw new ConflictException('이미 존재하는 슬러그입니다');
    }

    // 태그 처리
    let tags: TagEntity[] = [];
    if (createPostDto.tag_ids && createPostDto.tag_ids.length > 0) {
      tags = await this.tagRepository.findBy({ id: In(createPostDto.tag_ids) });
      if (tags.length !== createPostDto.tag_ids.length) {
        throw new BadRequestException('존재하지 않는 태그가 있습니다');
      }
    }

    const post = this.postRepository.create({
      id: uuidv4(),
      ...createPostDto,
      category_id: createPostDto.category_id,
      author_id: authorId || null,
      tags,
      published_at: createPostDto.is_published ? new Date() : null,
    });

    await this.postRepository.save(post);
    return this.findById(post.id);
  }

  // 포스트 수정
  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.findById(id);

    // 카테고리 확인
    if (updatePostDto.category_id && updatePostDto.category_id !== post.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: updatePostDto.category_id },
      });
      if (!category) {
        throw new BadRequestException('존재하지 않는 카테고리입니다');
      }
    }

    // slug 중복 확인 (수정 시)
    if (updatePostDto.slug && updatePostDto.slug !== post.slug) {
      const existingPost = await this.postRepository.findOne({
        where: { slug: updatePostDto.slug },
      });
      if (existingPost) {
        throw new ConflictException('이미 존재하는 슬러그입니다');
      }
    }

    // 태그 처리
    if (updatePostDto.tag_ids) {
      const tags = await this.tagRepository.findBy({ id: In(updatePostDto.tag_ids) });
      if (tags.length !== updatePostDto.tag_ids.length) {
        throw new BadRequestException('존재하지 않는 태그가 있습니다');
      }
      post.tags = tags;
    }

    // published_at 처리
    if (updatePostDto.is_published !== undefined) {
      if (updatePostDto.is_published && !post.published_at) {
        post.published_at = new Date();
      } else if (!updatePostDto.is_published) {
        post.published_at = null;
      }
    }

    Object.assign(post, updatePostDto);
    await this.postRepository.save(post);
    return this.findById(id);
  }

  // 포스트 삭제 (소프트 삭제)
  async delete(id: string) {
    const post = await this.findById(id);
    post.deleted_at = new Date();
    await this.postRepository.save(post);
  }

  // 포스트 영구 삭제
  async hardDelete(id: string) {
    const post = await this.findById(id);
    await this.postRepository.remove(post);
  }

  // AI 자동 발행용: 포스트 생성
  async createFromAI(
    title: string,
    slug: string,
    excerpt: string,
    content_md: string,
    content_html: string | null, // null일 경우 자동 렌더링
    category_id: string, // ID 또는 slug 모두 허용
    tag_names: string[],
    ai_source_urls: string[],
    reading_time_mins?: number,
  ) {
    // 카테고리 확인 (ID 또는 slug로 검색)
    let category = await this.categoryRepository.findOne({
      where: { id: category_id },
    });
    if (!category) {
      // slug로 재시도
      category = await this.categoryRepository.findOne({
        where: { slug: category_id },
      });
    }
    if (!category) {
      // 카테고리가 없으면 자동 생성
      category = this.categoryRepository.create({
        id: uuidv4(),
        slug: category_id,
        name_ko: category_id,
        description: '',
      });
      await this.categoryRepository.save(category);
    }
    category_id = category.id;

    // HTML 렌더링 (제공되지 않았을 경우)
    let finalContentHtml = content_html;
    if (!finalContentHtml) {
      finalContentHtml = await MarkdownUtil.toHtml(content_md);
    }

    // 읽는 시간 계산 (제공되지 않았을 경우)
    let finalReadingTime = reading_time_mins;
    if (!finalReadingTime) {
      finalReadingTime = MarkdownUtil.calculateReadingTime(content_md);
    }

    // 태그 생성 또는 기존 태그 찾기
    const tags: TagEntity[] = [];
    for (const tagName of tag_names) {
      let tag = await this.tagRepository.findOne({
        where: { name: tagName },
      });

      if (!tag) {
        // 슬러그 생성 - 빈 문자열이면 uuid 앞 8자리 사용
        let tagSlug = MarkdownUtil.generateSlug(tagName);
        if (!tagSlug || tagSlug.trim() === '') {
          tagSlug = uuidv4().substring(0, 8);
        }

        // 슬러그 중복 확인
        const existingBySlug = await this.tagRepository.findOne({
          where: { slug: tagSlug },
        });
        if (existingBySlug) {
          tagSlug = `${tagSlug}-${uuidv4().substring(0, 4)}`;
        }

        tag = this.tagRepository.create({
          id: uuidv4(),
          name: tagName,
          slug: tagSlug,
        });
        await this.tagRepository.save(tag);
      }

      tags.push(tag);
    }

    const post = this.postRepository.create({
      id: uuidv4(),
      title,
      slug,
      excerpt,
      content_md,
      content_html: finalContentHtml,
      category_id,
      tags,
      ai_source_urls,
      reading_time_mins: finalReadingTime,
      is_published: true,
      is_ai_generated: true,
      author_id: null,
      published_at: new Date(),
    });

    await this.postRepository.save(post);

    // 썸네일 생성 및 R2 업로드
    try {
      const hour = new Date().getHours();
      const trigger_type = hour >= 8 && hour < 14 ? 'morning'
        : hour >= 14 && hour < 22 ? 'afternoon' : 'evening';

      const thumbnailUrl = await this.thumbnailService.generateAndUpload({
        headline: title.substring(0, 44),
        subtext: excerpt.substring(0, 30),
        sentiment: 'neutral',
        tags: tag_names.slice(0, 3),
        category_slug: category_id,
        trigger_type,
      });

      post.cover_image_url = thumbnailUrl;
      await this.postRepository.save(post);
      console.log('✅ 썸네일 생성 완료:', thumbnailUrl);
    } catch (err) {
      console.warn('⚠️ 썸네일 생성 실패 (포스트는 발행됨):', err.message);
    }

    const savedPost = await this.findById(post.id);

    // ISR 재검증 트리거 (Next.js On-demand ISR)
    await this.triggerISRRevalidation(slug);

    return savedPost;
  }

  // Next.js On-demand ISR 재검증 트리거
  private async triggerISRRevalidation(slug: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const revalidateSecret = process.env.REVALIDATE_SECRET || 'revalidate-secret';

    try {
      const response = await fetch(`${frontendUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': revalidateSecret,
        },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok) {
        console.warn(
          `ISR revalidation warning: received status ${response.status} from frontend revalidate API`,
        );
      } else {
        console.log(`✅ ISR revalidation triggered for slug: ${slug}`);
      }
    } catch (error) {
      // ISR 실패해도 포스트 발행은 성공 처리 (비동기 작업)
      console.warn('⚠️ ISR revalidation failed (non-blocking):', error);
    }
  }
}
