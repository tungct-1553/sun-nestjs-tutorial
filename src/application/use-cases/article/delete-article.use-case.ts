import { DeleteArticlePort } from '@application/ports/inbound/article/delete-article.port';
import { DeleteArticleCommand } from '@application/ports/inbound/article/article.types';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { ArticleForbiddenException } from '@domain/exceptions/article-forbidden.exception';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';

export class DeleteArticleUseCase implements DeleteArticlePort {
  constructor(private readonly articleRepository: ArticleRepositoryPort) {}

  async execute(command: DeleteArticleCommand): Promise<void> {
    const article = await this.articleRepository.findBySlug(command.slug);

    if (!article) {
      throw new ArticleNotFoundException();
    }

    if (article.authorId !== command.authorId) {
      throw new ArticleForbiddenException();
    }

    await this.articleRepository.delete(article.id);
  }
}