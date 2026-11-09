import { ProfileUseCase } from './profile.use-case';
import { UserRepositoryPort } from '@application/ports/outbound/user/user.repository.port';
import { FollowRepositoryPort } from '@application/ports/outbound/profile/follow.repository.port';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';
import { SelfFollowException } from '@domain/exceptions/self-follow.exception';
import { User } from '@domain/models/user';

describe('ProfileUseCase', () => {
  const target = new User({
    id: 'target-id',
    username: 'target',
    email: 'private@example.test',
    passwordHash: 'private-hash',
    bio: null,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  let users: jest.Mocked<UserRepositoryPort>;
  let follows: jest.Mocked<FollowRepositoryPort>;
  let useCase: ProfileUseCase;

  beforeEach(() => {
    users = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn().mockResolvedValue(target),
      create: jest.fn(),
      update: jest.fn(),
    };
    follows = {
      isFollowing: jest.fn().mockResolvedValue(false),
      follow: jest.fn(),
      unfollow: jest.fn(),
    };
    useCase = new ProfileUseCase(users, follows);
  });

  it('returns only public fields for anonymous viewers', async () => {
    expect(await useCase.getProfile('target')).toEqual({
      username: 'target',
      bio: null,
      image: null,
      following: false,
    });
    expect(follows.isFollowing.mock.calls).toHaveLength(0);
  });

  it('looks up the viewer relationship', async () => {
    follows.isFollowing.mockResolvedValue(true);
    expect((await useCase.getProfile('target', 'viewer-id')).following).toBe(
      true,
    );
    expect(follows.isFollowing.mock.calls).toContainEqual([
      'viewer-id',
      'target-id',
    ]);
  });

  it('follows or unfollows the target and returns persisted state', async () => {
    follows.isFollowing
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    expect(
      (await useCase.setFollowing('target', 'viewer-id', true)).following,
    ).toBe(true);
    expect(follows.follow.mock.calls).toContainEqual([
      'viewer-id',
      'target-id',
    ]);
    expect(
      (await useCase.setFollowing('target', 'viewer-id', false)).following,
    ).toBe(false);
    expect(follows.unfollow.mock.calls).toContainEqual([
      'viewer-id',
      'target-id',
    ]);
  });

  it('rejects self follow and does not mutate data', async () => {
    await expect(
      useCase.setFollowing('target', 'target-id', true),
    ).rejects.toBeInstanceOf(SelfFollowException);
    expect(follows.follow.mock.calls).toHaveLength(0);
  });

  it('returns not found for unknown users', async () => {
    users.findByUsername.mockResolvedValue(null);
    await expect(useCase.getProfile('missing')).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
    await expect(
      useCase.setFollowing('missing', 'viewer-id', true),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });
});
