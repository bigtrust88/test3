import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { CategoryEntity } from '../posts/entities/category.entity';
import { TagEntity } from '../posts/entities/tag.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { CATEGORIES, TAGS, TEST_USER, TEST_POSTS } from './seed-data';
import { MarkdownUtil } from '../common/utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get('DataSource');

  console.log('🌱 데이터베이스 시드 시작...\n');

  try {
    // 1. 카테고리 초기화
    console.log('📁 카테고리 생성 중...');
    const categoryRepository = dataSource.getRepository(CategoryEntity);

    for (const category of CATEGORIES) {
      const existing = await categoryRepository.findOne({
        where: { slug: category.slug },
      });

      if (!existing) {
        await categoryRepository.save(category);
        console.log(`   ✅ ${category.name_ko} 카테고리 생성됨`);
      } else {
        console.log(`   ⏭️  ${category.name_ko} 카테고리 (이미 존재)`);
      }
    }

    // 2. 태그 초기화
    console.log('\n🏷️  태그 생성 중...');
    const tagRepository = dataSource.getRepository(TagEntity);
    const createdTags = [];

    for (const tag of TAGS) {
      const existing = await tagRepository.findOne({
        where: { slug: tag.slug },
      });

      if (!existing) {
        const created = await tagRepository.save(tag);
        createdTags.push(created);
        console.log(`   ✅ ${tag.name} 태그 생성됨`);
      } else {
        createdTags.push(existing);
        console.log(`   ⏭️  ${tag.name} 태그 (이미 존재)`);
      }
    }

    // 3. 테스트 사용자 생성 (테스트 환경만)
    console.log('\n👤 테스트 사용자 생성 중...');
    const userRepository = dataSource.getRepository(UserEntity);
    const existingUser = await userRepository.findOne({
      where: { email: TEST_USER.email },
    });

    let adminUser = existingUser;
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
      adminUser = await userRepository.save({
        id: TEST_USER.id,
        email: TEST_USER.email,
        password_hash: hashedPassword,
        name: TEST_USER.name,
        role: TEST_USER.role,
      });
      console.log(`   ✅ 테스트 관리자 사용자 생성됨 (${TEST_USER.email})`);
    } else {
      console.log(`   ⏭️  테스트 관리자 사용자 (이미 존재)`);
    }

    // 4. 테스트 포스트 생성
    console.log('\n📝 테스트 포스트 생성 중...');
    const postRepository = dataSource.getRepository(PostEntity);

    for (const postData of TEST_POSTS) {
      const existing = await postRepository.findOne({
        where: { slug: postData.slug },
      });

      if (!existing) {
        // HTML 렌더링
        const content_html = await MarkdownUtil.toHtml(postData.content_md);

        // 읽는 시간 계산
        const reading_time_mins = MarkdownUtil.calculateReadingTime(
          postData.content_md,
        );

        // 카테고리 찾기
        const category = await categoryRepository.findOne({
          where: { slug: postData.category_slug },
        });

        // 태그 찾기
        const tags = await tagRepository.find({
          where: postData.tags.map((tagName) => ({ name: tagName })),
        });

        const post = await postRepository.save({
          id: uuidv4(),
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt,
          content_md: postData.content_md,
          content_html,
          reading_time_mins,
          cover_image_url: postData.cover_image_url,
          category,
          category_id: category.id,
          author_id: adminUser.id,
          tags,
          ai_source_urls: postData.ai_source_urls,
          is_ai_generated: postData.is_ai_generated,
          is_published: postData.is_published,
          published_at: postData.is_published ? new Date() : null,
        });

        console.log(`   ✅ "${postData.title}" 포스트 생성됨`);
      } else {
        console.log(`   ⏭️  "${postData.title}" 포스트 (이미 존재)`);
      }
    }

    console.log('\n✨ 데이터베이스 시드 완료!\n');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ 시드 실패:', message);
  } finally {
    await app.close();
  }
}

bootstrap();
