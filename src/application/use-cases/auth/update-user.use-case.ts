import { UpdateUserPort } from '@application/ports/inbound/auth/update-user.port';
import {
  AuthenticatedUserResult,
  UpdateUserCommand,
} from '@application/ports/inbound/auth/auth.types';
import { PasswordHasherPort } from '@application/ports/outbound/auth/password-hasher.port';
import { UserRepositoryPort } from '@application/ports/outbound/user/user.repository.port';
import { toAuthenticatedUserResult } from '@application/use-cases/auth/auth-user.mapper';
import { DuplicateEmailException } from '@domain/exceptions/duplicate-email.exception';
import { DuplicateUsernameException } from '@domain/exceptions/duplicate-username.exception';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';

export class UpdateUserUseCase implements UpdateUserPort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(command: UpdateUserCommand): Promise<AuthenticatedUserResult> {
    const user = await this.userRepository.findById(command.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (command.email && command.email !== user.email) {
      const existingEmail = await this.userRepository.findByEmail(
        command.email,
      );
      if (existingEmail) {
        throw new DuplicateEmailException();
      }
    }

    if (command.username && command.username !== user.username) {
      const existingUsername = await this.userRepository.findByUsername(
        command.username,
      );
      if (existingUsername) {
        throw new DuplicateUsernameException();
      }
    }

    const passwordHash = command.password
      ? await this.passwordHasher.hash(command.password)
      : undefined;

    const updatedUser = await this.userRepository.update(command.userId, {
      email: command.email,
      username: command.username,
      passwordHash,
      bio: command.bio,
      image: command.image,
    });

    return toAuthenticatedUserResult(updatedUser);
  }
}
