import { ArticleResult } from '@application/ports/inbound/article/article.types';

export interface GetArticlePort {
  execute(slug: string): Promise<ArticleResult>;
}