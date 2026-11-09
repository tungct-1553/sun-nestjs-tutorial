import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowRepositoryPort } from '@application/ports/outbound/profile/follow.repository.port';
import { mapFollowPersistenceError } from '@infrastructure/database/errors/database-error.mapper';
import { UserFollowEntity } from '@infrastructure/entities/user-follow.entity';

@Injectable()
export class FollowRepository implements FollowRepositoryPort {
  constructor(
    @InjectRepository(UserFollowEntity)
    private readonly repository: Repository<UserFollowEntity>,
  ) {}

  async isFollowing(followerId: string, followedId: string): Promise<boolean> {
    return this.repository.exists({ where: { followerId, followedId } });
  }

  async follow(followerId: string, followedId: string): Promise<void> {
    try {
      await this.repository
        .createQueryBuilder()
        .insert()
        .into(UserFollowEntity)
        .values({ followerId, followedId })
        .orIgnore()
        .execute();
    } catch (error) {
      return mapFollowPersistenceError(error);
    }
  }

  async unfollow(followerId: string, followedId: string): Promise<void> {
    await this.repository.delete({ followerId, followedId });
  }
}
