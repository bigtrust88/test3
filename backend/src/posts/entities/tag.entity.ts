import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToMany } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity('tags')
export class TagEntity {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column('varchar', { length: 100, unique: true })
  name: string;

  @Column('varchar', { length: 100, unique: true })
  slug: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToMany(() => PostEntity, (post) => post.tags)
  posts: PostEntity[];
}
