import {
  ArticleResult,
  CreateArticleCommand,
} from '@application/ports/inbound/article/article.types';

export interface CreateArticlePort {
  execute(command: CreateArticleCommand): Promise<ArticleResult>;
}