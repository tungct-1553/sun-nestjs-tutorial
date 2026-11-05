import { TranslatableException } from '@domain/exceptions/translatable.exception';

export class ArticleNotFoundException extends TranslatableException {
  constructor() {
    super('errors.article.not_found');
  }
}