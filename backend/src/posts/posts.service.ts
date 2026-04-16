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

  // 카테고리 초기 데이터 설정 (기존 slug 업데이트 + 누락 카테고리 추가)
  async seedCategories() {
    const canonical = [
      { slug: 'stock-analysis',      name_ko: '종목분석',   aliases: ['종목분석'] },
      { slug: 'market-trend',        name_ko: '시장동향',   aliases: ['시장동향'] },
      { slug: 'earnings',            name_ko: '실적발표',   aliases: ['실적발표'] },
      { slug: 'etf-analysis',        name_ko: 'ETF분석',    aliases: ['etf-분석', 'ETF분석'] },
      { slug: 'investment-strategy', name_ko: '투자전략',   aliases: ['투자전략'] },
    ];

    const results: string[] = [];

    for (const cat of canonical) {
      // 정상 slug로 이미 존재하는지 확인
      let existing = await this.categoryRepository.findOne({ where: { slug: cat.slug } });

      if (!existing) {
        // alias(한국어 slug)로 찾아서 slug 영어로 교체
        for (const alias of cat.aliases) {
          existing = await this.categoryRepository.findOne({ where: { slug: alias } });
          if (existing) break;
        }
      }

      if (existing) {
        existing.slug = cat.slug;
        existing.name_ko = cat.name_ko;
        await this.categoryRepository.save(existing);
        results.push(`updated: ${cat.slug}`);
      } else {
        const newCat = this.categoryRepository.create({
          id: uuidv4(),
          slug: cat.slug,
          name_ko: cat.name_ko,
          description: '',
        });
        await this.categoryRepository.save(newCat);
        results.push(`created: ${cat.slug}`);
      }
    }

    return results;
  }

  // 태그 전체 조회 (공개)
  async findAllTags() {
    return this.tagRepository.find({ order: { name: 'ASC' } });
  }

  async deleteTag(id: string) {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) throw new Error('Tag not found');
    await this.tagRepository.remove(tag);
    return { deleted: true, id };
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

    // 카테고리 확인 (slug 또는 id로 처리)
    const categoryIdentifier = updatePostDto.category_slug || updatePostDto.category_id;
    if (categoryIdentifier) {
      let category = await this.categoryRepository.findOne({ where: { id: categoryIdentifier } });
      if (!category) {
        category = await this.categoryRepository.findOne({ where: { slug: categoryIdentifier } });
      }
      if (!category) {
        category = this.categoryRepository.create({ id: uuidv4(), slug: categoryIdentifier, name_ko: categoryIdentifier, description: '' });
        await this.categoryRepository.save(category);
      }
      post.category_id = category.id;
    }

    // slug 중복 확인 (수정 시)
    if (updatePostDto.slug && updatePostDto.slug !== post.slug) {
      const existingPost = await this.postRepository.findOne({ where: { slug: updatePostDto.slug } });
      if (existingPost) {
        throw new ConflictException('이미 존재하는 슬러그입니다');
      }
    }

    // 태그 처리 (tag_names 우선)
    if (updatePostDto.tag_names && updatePostDto.tag_names.length > 0) {
      const tags: TagEntity[] = [];
      for (const tagName of updatePostDto.tag_names) {
        if (!tagName.trim()) continue;
        let tag = await this.tagRepository.findOne({ where: { name: tagName.trim() } });
        if (!tag) {
          let tagSlug = MarkdownUtil.generateSlug(tagName);
          if (!tagSlug) tagSlug = uuidv4().substring(0, 8);
          tag = this.tagRepository.create({ id: uuidv4(), name: tagName.trim(), slug: tagSlug });
          await this.tagRepository.save(tag);
        }
        tags.push(tag);
      }
      post.tags = tags;
    } else if (updatePostDto.tag_ids) {
      const tags = await this.tagRepository.findBy({ id: In(updatePostDto.tag_ids) });
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

    // 각 필드를 개별적으로 업데이트 (관계는 이미 처리됨)
    if (updatePostDto.title !== undefined) post.title = updatePostDto.title;
    if (updatePostDto.slug !== undefined) post.slug = updatePostDto.slug;
    if (updatePostDto.excerpt !== undefined) post.excerpt = updatePostDto.excerpt;
    if (updatePostDto.content_md !== undefined) {
      post.content_md = updatePostDto.content_md;
      // content_html이 명시적으로 제공되지 않으면 content_md로 자동 재생성
      if (updatePostDto.content_html === undefined) {
        post.content_html = await MarkdownUtil.toHtml(updatePostDto.content_md);
      }
    }
    if (updatePostDto.content_html !== undefined) post.content_html = updatePostDto.content_html;
    if (updatePostDto.reading_time_mins !== undefined) post.reading_time_mins = updatePostDto.reading_time_mins;
    if (updatePostDto.cover_image_url !== undefined) post.cover_image_url = updatePostDto.cover_image_url;
    if (updatePostDto.ai_source_urls !== undefined) post.ai_source_urls = updatePostDto.ai_source_urls;

    await this.postRepository.save(post);

    // ISR 재검증 트리거 (수정된 포스트 캐시 무효화)
    await this.triggerISRRevalidation(post.slug);

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
