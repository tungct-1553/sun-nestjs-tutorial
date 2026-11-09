import { ListCommentsPort } from '@application/ports/inbound/comment/list-comment.port';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { CommentRepositoryPort } from '@application/ports/outbound/comment/comment.repository.port';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';
import { toCommentResult } from './comment.mapper';

export class ListCommentsUseCase implements ListCommentsPort {
  constructor(
    private readonly articles: ArticleRepositoryPort,
    private readonly comments: CommentRepositoryPort,
  ) {}
  async execute(slug: string, viewerId?: string) {
    const article = await this.articles.findBySlug(slug);
    if (!article) throw new ArticleNotFoundException();
    return (await this.comments.findByArticleId(article.id, viewerId)).map(
      (comment) => toCommentResult(comment),
    );
  }
}
