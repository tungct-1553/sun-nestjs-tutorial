import {
  ArticleResult,
  UpdateArticleCommand,
} from '@application/ports/inbound/article/article.types';

export interface UpdateArticlePort {
  execute(command: UpdateArticleCommand): Promise<ArticleResult>;
}