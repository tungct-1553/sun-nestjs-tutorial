import { LoginUserUseCase } from '@application/use-cases/auth/login-user.use-case';
import { PasswordHasherPort } from '@application/ports/outbound/auth/password-hasher.port';
import { TokenServicePort } from '@application/ports/outbound/auth/token.service.port';
import { UserRepositoryPort } from '@application/ports/outbound/user/user.repository.port';
import { InvalidCredentialsException } from '@domain/exceptions/invalid-credentials.exception';
import { User } from '@domain/models/user';

describe('LoginUserUseCase', () => {
  const user = new User({
    id: 'user-1',
    email: 'jake@jake.jake',
    username: 'jake',
    passwordHash: 'hashed',
    bio: null,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const userRepository: jest.Mocked<UserRepositoryPort> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const passwordHasher: jest.Mocked<PasswordHasherPort> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const tokenService: jest.Mocked<TokenServicePort> = {
    sign: jest.fn(),
  };

  const useCase = new LoginUserUseCase(
    userRepository,
    passwordHasher,
    tokenService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns user with token for valid credentials', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(true);
    tokenService.sign.mockReturnValue('jwt.token');

    const result = await useCase.execute({
      email: 'jake@jake.jake',
      password: 'jakejake',
    });

    expect(result).toEqual({
      email: 'jake@jake.jake',
      username: 'jake',
      bio: null,
      image: null,
      token: 'jwt.token',
    });
  });

  it('throws when credentials are invalid', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'jake@jake.jake',
        password: 'wrong',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);
  });
});
