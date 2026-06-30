import { TranslatableException } from '@domain/exceptions/translatable.exception';

export class DuplicateEmailException extends TranslatableException {
  constructor() {
    super('errors.auth.email_taken');
  }
}
