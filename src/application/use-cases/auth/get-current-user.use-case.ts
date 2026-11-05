import { GetCurrentUserPort } from '@application/ports/inbound/auth/get-current-user.port';
import { AuthenticatedUserResult } from '@application/ports/inbound/auth/auth.types';
import { UserRepositoryPort } from '@application/ports/outbound/user/user.repository.port';
import { toAuthenticatedUserResult } from '@application/use-cases/auth/auth-user.mapper';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';

export class GetCurrentUserUseCase implements GetCurrentUserPort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string): Promise<AuthenticatedUserResult> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    return toAuthenticatedUserResult(user);
  }
}
