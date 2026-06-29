import { TranslatableException } from '@domain/exceptions/translatable.exception';

export class DuplicateUsernameException extends TranslatableException {
  constructor() {
    super('errors.auth.username_taken');
  }
}
