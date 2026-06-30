import { DomainException } from '@domain/exceptions/domain.exception';

export class UserNotFoundException extends DomainException {
  constructor() {
    super('User not found');
  }
}
