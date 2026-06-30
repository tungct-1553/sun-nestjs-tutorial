import {
  AuthenticatedUserResult,
  UpdateUserCommand,
} from '@application/ports/inbound/auth/auth.types';

export interface UpdateUserPort {
  execute(command: UpdateUserCommand): Promise<AuthenticatedUserResult>;
}
