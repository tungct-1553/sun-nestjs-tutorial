import { DomainException } from '@domain/exceptions/domain.exception';

export class UnauthorizedException extends DomainException {
  constructor() {
    super('Authentication required');
  }
}
