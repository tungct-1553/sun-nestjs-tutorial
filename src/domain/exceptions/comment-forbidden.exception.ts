import { TranslatableException } from '@domain/exceptions/translatable.exception';

export class CommentForbiddenException extends TranslatableException {
  constructor() {
    super('errors.comment.forbidden');
  }
}
