import {
  AuthenticatedUserResult,
  RegisterUserCommand,
} from '@application/ports/inbound/auth/auth.types';

export interface RegisterUserPort {
  execute(command: RegisterUserCommand): Promise<AuthenticatedUserResult>;
}
