import { DomainException } from '@domain/exceptions/domain.exception';

export class DuplicateUsernameException extends DomainException {
  constructor() {
    super('Username is already taken');
  }
}
