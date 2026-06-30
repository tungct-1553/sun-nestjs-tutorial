export interface AuthenticatedUserResult {
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token?: string;
}

export interface RegisterUserCommand {
  email: string;
  username: string;
  password: string;
}

export interface LoginUserCommand {
  email: string;
  password: string;
}

export interface UpdateUserCommand {
  userId: string;
  email?: string;
  username?: string;
  password?: string;
  bio?: string | null;
  image?: string | null;
}
