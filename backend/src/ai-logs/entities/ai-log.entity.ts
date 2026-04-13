import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { PostEntity } from '@/posts/entities/post.entity';

@Entity('ai_post_logs')
@Index(['status'])
@Index(['is_success'])
@Index(['n8n_execution_id'], { unique: true })
@Index(['created_at'])
@Index(['thumbnail_generated'])
export class AiLogEntity {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column('char', { length: 36, nullable: true })
  post_id: string | null; // NULL = 포스트 생성 실패

  @ManyToOne(() => PostEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity | null;

  @Column('varchar', { length: 100, unique: true })
  n8n_execution_id: string;

  @Column('timestamp')
  trigger_time: Date;

  @Column('enum', {
    enum: ['morning', 'afternoon', 'evening'],
  })
  trigger_type: 'morning' | 'afternoon' | 'evening';

  @Column('json', { nullable: true })
  crawled_urls: string[]; // 뉴스 크롤링 출처 URLs

  @Column('int')
  claude_prompt_tokens: number;

  @Column('int')
  claude_completion_tokens: number;

  @Column('varchar', { length: 50 })
  claude_model: string; // claude-3-5-sonnet-20241022

  @Column('enum', {
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  })
  status: 'pending' | 'success' | 'failed';

  @Column('boolean', { default: false })
  is_success: boolean;

  @Column('text', { nullable: true })
  error_message: string | null;

  // 썸네일 생성 로그
  @Column('boolean', { default: false })
  thumbnail_generated: boolean;

  @Column('varchar', { length: 500, nullable: true })
  thumbnail_url: string | null;

  @Column('varchar', { length: 100, nullable: true })
  bannerbear_uid: string | null;

  @Column('enum', {
    enum: ['bullish', 'bearish', 'neutral'],
    nullable: true,
  })
  thumbnail_sentiment: 'bullish' | 'bearish' | 'neutral' | null;

  @CreateDateColumn()
  created_at: Date;
}
