import { DomainException } from '@domain/exceptions/domain.exception';

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Email or password is invalid');
  }
}
