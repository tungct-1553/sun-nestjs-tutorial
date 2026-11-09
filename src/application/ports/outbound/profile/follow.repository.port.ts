export interface FollowRepositoryPort {
  isFollowing(followerId: string, followedId: string): Promise<boolean>;
  follow(followerId: string, followedId: string): Promise<void>;
  unfollow(followerId: string, followedId: string): Promise<void>;
}
