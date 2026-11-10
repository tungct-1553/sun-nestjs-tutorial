import { Comment } from '@domain/models/comment';
import { CommentResult } from '@application/ports/inbound/comment/comment.types';

export function toCommentResult(comment: Comment): CommentResult {
  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    author: {
      username: comment.author.username,
      bio: comment.author.bio,
      image: comment.author.image,
      following: comment.author.following ?? false,
    },
  };
}
