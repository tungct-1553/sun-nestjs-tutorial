import { CommentResult } from './comment.types';

export interface CreateCommentPort {
  execute(slug: string, authorId: string, body: string): Promise<CommentResult>;
}
