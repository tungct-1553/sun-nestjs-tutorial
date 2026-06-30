import { DomainException } from '@domain/exceptions/domain.exception';

export class DuplicateEmailException extends DomainException {
  constructor() {
    super('Email is already taken');
  }
}
