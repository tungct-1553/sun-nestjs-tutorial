import { FavoriteArticlePort } from '@application/ports/inbound/article/favorite-article.port';
import { ArticleResult } from '@application/ports/inbound/article/article.types';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { toArticleResult } from '@application/use-cases/article/article.mapper';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';

export class FavoriteArticleUseCase implements FavoriteArticlePort {
  constructor(private readonly articleRepository: ArticleRepositoryPort) {}

  async execute(
    slug: string,
    userId: string,
    favorite: boolean,
  ): Promise<ArticleResult> {
    const article = await this.articleRepository.findBySlug(slug, userId);
    if (!article) throw new ArticleNotFoundException();
    if (favorite) await this.articleRepository.addFavorite(article.id, userId);
    else await this.articleRepository.removeFavorite(article.id, userId);
    const updated = await this.articleRepository.findBySlug(slug, userId);
    if (!updated) throw new ArticleNotFoundException();
    return toArticleResult(updated);
  }
}
