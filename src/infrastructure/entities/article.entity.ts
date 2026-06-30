import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TagEntity } from '@infrastructure/entities/tag.entity';
import { UserEntity } from '@infrastructure/entities/user.entity';

@Entity('articles')
export class ArticleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  slug!: string;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ name: 'author_id' })
  authorId!: string;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'author_id' })
  author!: UserEntity;

  @ManyToMany(() => TagEntity, { eager: true, cascade: true })
  @JoinTable({
    name: 'article_tags',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: TagEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}