import { DomainException } from '@domain/exceptions/domain.exception';

export class InternalException extends DomainException {
  constructor(public readonly cause?: unknown) {
    super('Internal server error');
  }
}