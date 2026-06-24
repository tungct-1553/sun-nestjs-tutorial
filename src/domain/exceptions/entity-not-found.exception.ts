import { DomainException } from '@domain/exceptions/domain.exception';

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} with identifier "${identifier}" was not found`);
  }
}
