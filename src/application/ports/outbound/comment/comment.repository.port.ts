import { Comment } from '@domain/models/comment';

export interface CommentRepositoryPort {
  create(articleId: string, authorId: string, body: string): Promise<Comment>;
  findByArticleId(articleId: string, viewerId?: string): Promise<Comment[]>;
  findByIdAndArticleId(id: string, articleId: string): Promise<Comment | null>;
  delete(id: string): Promise<void>;
}
