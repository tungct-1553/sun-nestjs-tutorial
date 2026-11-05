import { RegisterUserUseCase } from '@application/use-cases/auth/register-user.use-case';
import { PasswordHasherPort } from '@application/ports/outbound/auth/password-hasher.port';
import { TokenServicePort } from '@application/ports/outbound/auth/token.service.port';
import { UserRepositoryPort } from '@application/ports/outbound/user/user.repository.port';
import { DuplicateEmailException } from '@domain/exceptions/duplicate-email.exception';
import { User } from '@domain/models/user';

describe('RegisterUserUseCase', () => {
  const existingUser = new User({
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

  const useCase = new RegisterUserUseCase(
    userRepository,
    passwordHasher,
    tokenService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a user and returns token', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed-password');
    userRepository.create.mockResolvedValue(existingUser);
    tokenService.sign.mockReturnValue('jwt.token');

    const result = await useCase.execute({
      email: 'jake@jake.jake',
      username: 'jake',
      password: 'jakejake',
    });

    expect(passwordHasher.hash.mock.calls).toEqual([['jakejake']]);
    expect(userRepository.create.mock.calls[0]?.[0]).toEqual({
      email: 'jake@jake.jake',
      username: 'jake',
      passwordHash: 'hashed-password',
    });
    expect(result).toEqual({
      email: 'jake@jake.jake',
      username: 'jake',
      bio: null,
      image: null,
      token: 'jwt.token',
    });
  });

  it('throws when email is already taken', async () => {
    userRepository.findByEmail.mockResolvedValue(existingUser);
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'jake@jake.jake',
        username: 'new-user',
        password: 'password',
      }),
    ).rejects.toBeInstanceOf(DuplicateEmailException);
  });
});
