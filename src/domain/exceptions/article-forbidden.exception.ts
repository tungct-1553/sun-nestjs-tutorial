import { TranslatableException } from '@domain/exceptions/translatable.exception';

export class ArticleForbiddenException extends TranslatableException {
  constructor() {
    super('errors.article.forbidden');
  }
}