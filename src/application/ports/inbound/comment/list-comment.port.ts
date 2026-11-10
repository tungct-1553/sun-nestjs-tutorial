import { CommentResult } from './comment.types';

export interface ListCommentsPort {
  execute(slug: string, viewerId?: string): Promise<CommentResult[]>;
}
