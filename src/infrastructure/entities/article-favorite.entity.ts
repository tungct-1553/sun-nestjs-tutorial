import { Entity, PrimaryColumn } from 'typeorm';

@Entity('article_favorites')
export class ArticleFavoriteEntity {
  @PrimaryColumn({ type: 'uuid', name: 'article_id' })
  articleId!: string;

  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId!: string;
}
