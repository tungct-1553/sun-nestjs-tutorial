import { ArticleResult } from './article.types';

export interface FavoriteArticlePort {
  execute(
    slug: string,
    userId: string,
    favorite: boolean,
  ): Promise<ArticleResult>;
}
