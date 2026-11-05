import { AuthenticatedUserResult } from '@application/ports/inbound/auth/auth.types';
import { User } from '@domain/models/user';

export const toAuthenticatedUserResult = (
  user: User,
  token?: string,
): AuthenticatedUserResult => ({
  email: user.email,
  username: user.username,
  bio: user.bio,
  image: user.image,
  ...(token ? { token } : {}),
});
