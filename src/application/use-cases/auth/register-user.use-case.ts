import { RegisterUserPort } from '@application/ports/inbound/auth/register-user.port';
import {
  AuthenticatedUserResult,
  RegisterUserCommand,
} from '@application/ports/inbound/auth/auth.types';
import { PasswordHasherPort } from '@application/ports/outbound/auth/password-hasher.port';
import { TokenServicePort } from '@application/ports/outbound/auth/token.service.port';
import { UserRepositoryPort } from '@application/ports/outbound/user/user.repository.port';
import { toAuthenticatedUserResult } from '@application/use-cases/auth/auth-user.mapper';
import { DuplicateEmailException } from '@domain/exceptions/duplicate-email.exception';
import { DuplicateUsernameException } from '@domain/exceptions/duplicate-username.exception';

export class RegisterUserUseCase implements RegisterUserPort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(
    command: RegisterUserCommand,
  ): Promise<AuthenticatedUserResult> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.userRepository.findByEmail(command.email),
      this.userRepository.findByUsername(command.username),
    ]);

    if (existingEmail) {
      throw new DuplicateEmailException();
    }

    if (existingUsername) {
      throw new DuplicateUsernameException();
    }

    const passwordHash = await this.passwordHasher.hash(command.password);
    const user = await this.userRepository.create({
      email: command.email,
      username: command.username,
      passwordHash,
    });

    const token = this.tokenService.sign(user.id);
    return toAuthenticatedUserResult(user, token);
  }
}
