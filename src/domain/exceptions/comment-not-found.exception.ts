import { TranslatableException } from '@domain/exceptions/translatable.exception';

export class CommentNotFoundException extends TranslatableException {
  constructor() {
    super('errors.comment.not_found');
  }
}
