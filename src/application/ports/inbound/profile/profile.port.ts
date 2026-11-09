export interface ProfileResult {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export interface ProfilePort {
  getProfile(username: string, viewerId?: string): Promise<ProfileResult>;
  setFollowing(
    username: string,
    viewerId: string,
    following: boolean,
  ): Promise<ProfileResult>;
}
