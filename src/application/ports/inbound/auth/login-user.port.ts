import {
  AuthenticatedUserResult,
  LoginUserCommand,
} from '@application/ports/inbound/auth/auth.types';

export interface LoginUserPort {
  execute(command: LoginUserCommand): Promise<AuthenticatedUserResult>;
}
