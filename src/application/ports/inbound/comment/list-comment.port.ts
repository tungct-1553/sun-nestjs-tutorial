import { CommentResult } from './comment.types';

export interface ListCommentsPort {
  execute(slug: string): Promise<CommentResult[]>;
}
