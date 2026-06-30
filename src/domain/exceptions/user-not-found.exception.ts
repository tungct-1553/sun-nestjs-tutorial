import { TranslatableException } from '@domain/exceptions/translatable.exception';

export class UserNotFoundException extends TranslatableException {
  constructor() {
    super('errors.user.not_found');
  }
}
