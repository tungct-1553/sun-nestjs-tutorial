import { ListArticlesPort } from '@application/ports/inbound/article/list-articles.port';
import {
  ArticlesListResult,
  ListArticlesQuery,
} from '@application/ports/inbound/article/article.types';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { toArticleResult } from '@application/use-cases/article/article.mapper';

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

export class ListArticlesUseCase implements ListArticlesPort {
  constructor(private readonly articleRepository: ArticleRepositoryPort) {}

  async execute(query: ListArticlesQuery): Promise<ArticlesListResult> {
    const filters = {
      tag: query.tag,
      authorUsername: query.author,
      limit: query.limit ?? DEFAULT_LIMIT,
      offset: query.offset ?? DEFAULT_OFFSET,
    };

    const [articles, articlesCount] = await Promise.all([
      this.articleRepository.findMany(filters),
      this.articleRepository.count(filters),
    ]);

    return {
      articles: articles.map((article) =>
        toArticleResult(article, { includeBody: false }),
      ),
      articlesCount,
    };
  }
}