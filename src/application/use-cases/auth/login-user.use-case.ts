import { LoginUserPort } from '@application/ports/inbound/auth/login-user.port';
import {
  AuthenticatedUserResult,
  LoginUserCommand,
} from '@application/ports/inbound/auth/auth.types';
import { PasswordHasherPort } from '@application/ports/outbound/auth/password-hasher.port';
import { TokenServicePort } from '@application/ports/outbound/auth/token.service.port';
import { UserRepositoryPort } from '@application/ports/outbound/user/user.repository.port';
import { toAuthenticatedUserResult } from '@application/use-cases/auth/auth-user.mapper';
import { InvalidCredentialsException } from '@domain/exceptions/invalid-credentials.exception';

export class LoginUserUseCase implements LoginUserPort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(command: LoginUserCommand): Promise<AuthenticatedUserResult> {
    const user = await this.userRepository.findByEmail(command.email);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.passwordHasher.compare(
      command.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const token = this.tokenService.sign(user.id);
    return toAuthenticatedUserResult(user, token);
  }
}
