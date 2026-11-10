import { TranslatableException } from '@domain/exceptions/translatable.exception';

export class SelfFollowException extends TranslatableException {
  constructor() {
    super('errors.user.self_follow');
  }
}
