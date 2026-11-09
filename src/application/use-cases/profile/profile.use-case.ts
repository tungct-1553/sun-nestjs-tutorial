import {
  ProfilePort,
  ProfileResult,
} from '@application/ports/inbound/profile/profile.port';
import { FollowRepositoryPort } from '@application/ports/outbound/profile/follow.repository.port';
import { UserRepositoryPort } from '@application/ports/outbound/user/user.repository.port';
import { SelfFollowException } from '@domain/exceptions/self-follow.exception';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';

export class ProfileUseCase implements ProfilePort {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly follows: FollowRepositoryPort,
  ) {}

  async getProfile(
    username: string,
    viewerId?: string,
  ): Promise<ProfileResult> {
    const user = await this.users.findByUsername(username);
    if (!user) throw new UserNotFoundException();
    const following = viewerId
      ? await this.follows.isFollowing(viewerId, user.id)
      : false;
    return {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following,
    };
  }

  async setFollowing(
    username: string,
    viewerId: string,
    following: boolean,
  ): Promise<ProfileResult> {
    const user = await this.users.findByUsername(username);
    if (!user) throw new UserNotFoundException();
    if (viewerId === user.id) throw new SelfFollowException();
    if (following) await this.follows.follow(viewerId, user.id);
    else await this.follows.unfollow(viewerId, user.id);
    return {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following: await this.follows.isFollowing(viewerId, user.id),
    };
  }
}
