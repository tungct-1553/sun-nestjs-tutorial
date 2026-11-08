import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ArticleEntity } from '@infrastructure/entities/article.entity';
import { UserEntity } from '@infrastructure/entities/user.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'text' }) body!: string;
  @Column({ name: 'article_id', type: 'uuid' }) articleId!: string;
  @ManyToOne(() => ArticleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article!: ArticleEntity;
  @Column({ name: 'author_id', type: 'uuid' }) authorId!: string;
  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: UserEntity;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
