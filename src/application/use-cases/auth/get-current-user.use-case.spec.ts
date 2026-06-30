import { GetCurrentUserUseCase } from '@application/use-cases/auth/get-current-user.use-case';
import { UserRepositoryPort } from '@application/ports/outbound/user/user.repository.port';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';
import { User } from '@domain/models/user';

describe('GetCurrentUserUseCase', () => {
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

  const useCase = new GetCurrentUserUseCase(userRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns authenticated user result', async () => {
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute('user-1');

    expect(result).toEqual({
      email: 'jake@jake.jake',
      username: 'jake',
      bio: null,
      image: null,
    });
  });

  it('throws when user is not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
  });
});