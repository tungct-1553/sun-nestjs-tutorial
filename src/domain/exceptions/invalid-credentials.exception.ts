import { TranslatableException } from '@domain/exceptions/translatable.exception';

export class InvalidCredentialsException extends TranslatableException {
  constructor() {
    super('errors.auth.invalid_credentials');
  }
}
