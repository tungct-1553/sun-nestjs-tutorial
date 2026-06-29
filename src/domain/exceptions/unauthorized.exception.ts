import { TranslatableException } from '@domain/exceptions/translatable.exception';

export class UnauthorizedException extends TranslatableException {
  constructor() {
    super('errors.auth.unauthorized');
  }
}
