import { GetArticlePort } from '@application/ports/inbound/article/get-article.port';
import { ArticleResult } from '@application/ports/inbound/article/article.types';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { toArticleResult } from '@application/use-cases/article/article.mapper';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';

export class GetArticleUseCase implements GetArticlePort {
  constructor(private readonly articleRepository: ArticleRepositoryPort) {}

  async execute(slug: string): Promise<ArticleResult> {
    const article = await this.articleRepository.findBySlug(slug);

    if (!article) {
      throw new ArticleNotFoundException();
    }

    return toArticleResult(article);
  }
}