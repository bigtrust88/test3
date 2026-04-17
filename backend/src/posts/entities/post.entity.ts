import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, Index } from 'typeorm';
import { CategoryEntity } from './category.entity';
import { TagEntity } from './tag.entity';
import { UserEntity } from '@/auth/entities/user.entity';

@Entity('posts')
@Index(['slug'], { unique: true })
@Index(['published_at', 'is_published'])
@Index(['is_ai_generated'])
@Index(['category_id'])
export class PostEntity {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('varchar', { length: 255, unique: true })
  slug: string;

  @Column('text')
  excerpt: string;

  @Column('longtext')
  content_md: string; // 마크다운 원본

  @Column('longtext')
  content_html: string; // 렌더링된 HTML

  @Column('int', { default: 0 })
  reading_time_mins: number;

  @Column('varchar', { length: 255, nullable: true })
  cover_image_url: string;

  // Thumbnail Metadata (Bannerbear API)
  @Column('varchar', { length: 44, nullable: true })
  thumbnail_headline: string;

  @Column('varchar', { length: 30, nullable: true })
  thumbnail_subtext: string;

  @Column('enum', { enum: ['bullish', 'bearish', 'neutral'], nullable: true })
  thumbnail_sentiment: string;

  @Column('enum', { enum: ['morning', 'afternoon', 'evening'], nullable: true })
  trigger_type: string;

  @Column('json', { nullable: true })
  highlight_keywords: string[];

  @Column('boolean', { default: false })
  is_published: boolean;

  @Column('boolean', { default: false })
  is_ai_generated: boolean;

  @Column('json', { nullable: true })
  ai_source_urls: string[]; // 뉴스 크롤링 소스 URL 배열

  @ManyToOne(() => CategoryEntity, (category) => category.posts)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @Column('char', { length: 36 })
  category_id: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author: UserEntity | null; // NULL = AI 생성

  @Column('char', { length: 36, nullable: true })
  author_id: string | null;

  @ManyToMany(() => TagEntity, (tag) => tag.posts)
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: TagEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('timestamp', { nullable: true })
  published_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
