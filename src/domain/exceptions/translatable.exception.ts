import { DomainException } from '@domain/exceptions/domain.exception';

export abstract class TranslatableException extends DomainException {
  constructor(
    public readonly translationKey: string,
    public readonly translationArgs?: Record<string, string | number>,
  ) {
    super(translationKey);
  }
}
