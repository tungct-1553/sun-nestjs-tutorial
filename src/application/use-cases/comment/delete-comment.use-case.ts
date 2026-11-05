import { DeleteCommentPort } from '@application/ports/inbound/comment/delete-comment.port';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { CommentRepositoryPort } from '@application/ports/outbound/comment/comment.repository.port';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';
import { CommentNotFoundException } from '@domain/exceptions/comment-not-found.exception';
import { CommentForbiddenException } from '@domain/exceptions/comment-forbidden.exception';

export class DeleteCommentUseCase implements DeleteCommentPort {
  constructor(
    private readonly articles: ArticleRepositoryPort,
    private readonly comments: CommentRepositoryPort,
  ) {}
  async execute(slug: string, id: string, authorId: string): Promise<void> {
    const article = await this.articles.findBySlug(slug);
    if (!article) throw new ArticleNotFoundException();
    const comment = await this.comments.findByIdAndArticleId(id, article.id);
    if (!comment) throw new CommentNotFoundException();
    if (comment.authorId !== authorId) throw new CommentForbiddenException();
    await this.comments.delete(comment.id);
  }
}
