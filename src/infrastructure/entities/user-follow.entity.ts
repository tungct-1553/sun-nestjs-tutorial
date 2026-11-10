import { Entity, PrimaryColumn } from 'typeorm';

@Entity('user_follows')
export class UserFollowEntity {
  @PrimaryColumn('uuid', { name: 'follower_id' })
  followerId!: string;

  @PrimaryColumn('uuid', { name: 'followed_id' })
  followedId!: string;
}
