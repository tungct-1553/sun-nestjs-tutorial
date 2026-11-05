import { UpdateUserUseCase } from '@application/use-cases/auth/update-user.use-case';
import { PasswordHasherPort } from '@application/ports/outbound/auth/password-hasher.port';
import { UserRepositoryPort } from '@application/ports/outbound/user/user.repository.port';
import { DuplicateEmailException } from '@domain/exceptions/duplicate-email.exception';
import { DuplicateUsernameException } from '@domain/exceptions/duplicate-username.exception';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';
import { User } from '@domain/models/user';

describe('UpdateUserUseCase', () => {
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

  const otherUser = new User({
    id: 'user-2',
    email: 'other@other.other',
    username: 'other',
    passwordHash: 'hashed',
    bio: null,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const updatedUser = new User({
    id: 'user-1',
    email: 'new@new.new',
    username: 'newjake',
    passwordHash: 'new-hashed',
    bio: 'bio',
    image: 'image',
    createdAt: user.createdAt,
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

  const useCase = new UpdateUserUseCase(userRepository, passwordHasher);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates user and returns authenticated result', async () => {
    userRepository.findById.mockResolvedValue(user);
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('new-hashed');
    userRepository.update.mockResolvedValue(updatedUser);

    const result = await useCase.execute({
      userId: 'user-1',
      email: 'new@new.new',
      username: 'newjake',
      password: 'newpassword',
      bio: 'bio',
      image: 'image',
    });

    expect(passwordHasher.hash.mock.calls).toEqual([['newpassword']]);
    expect(userRepository.update.mock.calls[0]?.[1]).toEqual({
      email: 'new@new.new',
      username: 'newjake',
      passwordHash: 'new-hashed',
      bio: 'bio',
      image: 'image',
    });
    expect(result).toEqual({
      email: 'new@new.new',
      username: 'newjake',
      bio: 'bio',
      image: 'image',
    });
  });

  it('throws when user is not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'missing', email: 'new@new.new' }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });

  it('throws when email is already taken', async () => {
    userRepository.findById.mockResolvedValue(user);
    userRepository.findByEmail.mockResolvedValue(otherUser);

    await expect(
      useCase.execute({ userId: 'user-1', email: 'other@other.other' }),
    ).rejects.toBeInstanceOf(DuplicateEmailException);
  });

  it('throws when username is already taken', async () => {
    userRepository.findById.mockResolvedValue(user);
    userRepository.findByUsername.mockResolvedValue(otherUser);

    await expect(
      useCase.execute({ userId: 'user-1', username: 'other' }),
    ).rejects.toBeInstanceOf(DuplicateUsernameException);
  });

  it('skips password hashing when password is not provided', async () => {
    userRepository.findById.mockResolvedValue(user);
    userRepository.update.mockResolvedValue(user);

    await useCase.execute({ userId: 'user-1', bio: 'updated bio' });

    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(userRepository.update.mock.calls[0]?.[1]).toEqual({
      email: undefined,
      username: undefined,
      passwordHash: undefined,
      bio: 'updated bio',
      image: undefined,
    });
  });
});