import { UpdateArticlePort } from '@application/ports/inbound/article/update-article.port';
import {
  ArticleResult,
  UpdateArticleCommand,
} from '@application/ports/inbound/article/article.types';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { toArticleResult } from '@application/use-cases/article/article.mapper';
import { ArticleForbiddenException } from '@domain/exceptions/article-forbidden.exception';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';
import { resolveUniqueSlug } from '@domain/services/article-slug.service';

export class UpdateArticleUseCase implements UpdateArticlePort {
  constructor(private readonly articleRepository: ArticleRepositoryPort) {}

  async execute(command: UpdateArticleCommand): Promise<ArticleResult> {
    const article = await this.articleRepository.findBySlug(command.slug);

    if (!article) {
      throw new ArticleNotFoundException();
    }

    if (article.authorId !== command.authorId) {
      throw new ArticleForbiddenException();
    }

    let slug = article.slug;
    if (command.title !== undefined && command.title !== article.title) {
      slug = await resolveUniqueSlug(command.title, (candidate) =>
        this.articleRepository.slugExists(candidate, article.id),
      );
    }

    const updatedArticle = await this.articleRepository.update(article.id, {
      slug,
      title: command.title,
      description: command.description,
      body: command.body,
      tagList: command.tagList,
    });

    return toArticleResult(updatedArticle);
  }
}