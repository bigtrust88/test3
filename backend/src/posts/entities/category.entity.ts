import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column('varchar', { length: 100, unique: true })
  slug: string; // 종목분석, 시장동향, 실적발표, etf-분석, 투자전략

  @Column('varchar', { length: 100 })
  name_ko: string;

  @Column('varchar', { length: 255, nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => PostEntity, (post) => post.category)
  posts: PostEntity[];
}
