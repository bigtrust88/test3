import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { CategoriesController } from './categories.controller';
import { TagsController } from './tags.controller';
import { PostEntity } from './entities/post.entity';
import { CategoryEntity } from './entities/category.entity';
import { TagEntity } from './entities/tag.entity';
import { ThumbnailModule } from '../thumbnails/thumbnail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, CategoryEntity, TagEntity]),
    ThumbnailModule,
  ],
  providers: [PostsService],
  controllers: [PostsController, CategoriesController, TagsController],
  exports: [PostsService],
})
export class PostsModule {}
