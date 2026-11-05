import { CreateCommentPort } from '@application/ports/inbound/comment/create-comment.port';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { CommentRepositoryPort } from '@application/ports/outbound/comment/comment.repository.port';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';
import { toCommentResult } from './comment.mapper';

export class CreateCommentUseCase implements CreateCommentPort {
  constructor(
    private readonly articles: ArticleRepositoryPort,
    private readonly comments: CommentRepositoryPort,
  ) {}
  async execute(slug: string, authorId: string, body: string) {
    const article = await this.articles.findBySlug(slug);
    if (!article) throw new ArticleNotFoundException();
    return toCommentResult(
      await this.comments.create(article.id, authorId, body),
    );
  }
}
