import { AuthenticatedUserResult } from '@application/ports/inbound/auth/auth.types';

export class UserResponseDto {
  user: AuthenticatedUserResult;

  constructor(user: AuthenticatedUserResult) {
    this.user = user;
  }
}
