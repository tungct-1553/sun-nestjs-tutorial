import { AuthenticatedUserResult } from '@application/ports/inbound/auth/auth.types';

export interface GetCurrentUserPort {
  execute(userId: string): Promise<AuthenticatedUserResult>;
}
