import { ArticleAuthorResult } from '@application/ports/inbound/article/article.types';

export interface CommentResult {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: ArticleAuthorResult;
}
