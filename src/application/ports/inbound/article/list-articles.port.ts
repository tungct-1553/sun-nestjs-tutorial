import {
  ArticlesListResult,
  ListArticlesQuery,
} from '@application/ports/inbound/article/article.types';

export interface ListArticlesPort {
  execute(query: ListArticlesQuery): Promise<ArticlesListResult>;
}