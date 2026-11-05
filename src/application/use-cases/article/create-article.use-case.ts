import { CreateArticlePort } from '@application/ports/inbound/article/create-article.port';
import {
  ArticleResult,
  CreateArticleCommand,
} from '@application/ports/inbound/article/article.types';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { toArticleResult } from '@application/use-cases/article/article.mapper';
import { resolveUniqueSlug } from '@domain/services/article-slug.service';

export class CreateArticleUseCase implements CreateArticlePort {
  constructor(private readonly articleRepository: ArticleRepositoryPort) {}

  async execute(command: CreateArticleCommand): Promise<ArticleResult> {
    const slug = await resolveUniqueSlug(command.title, (candidate) =>
      this.articleRepository.slugExists(candidate),
    );

    const article = await this.articleRepository.create({
      slug,
      title: command.title,
      description: command.description,
      body: command.body,
      authorId: command.authorId,
      tagList: command.tagList ?? [],
    });

    return toArticleResult(article);
  }
}