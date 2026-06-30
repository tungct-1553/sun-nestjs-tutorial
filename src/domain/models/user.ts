export interface UserProps {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  bio: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly passwordHash: string;
  readonly bio: string | null;
  readonly image: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.username = props.username;
    this.passwordHash = props.passwordHash;
    this.bio = props.bio;
    this.image = props.image;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  withUpdates(
    updates: Partial<
      Pick<UserProps, 'email' | 'username' | 'passwordHash' | 'bio' | 'image'>
    >,
  ): User {
    return new User({
      id: this.id,
      email: updates.email ?? this.email,
      username: updates.username ?? this.username,
      passwordHash: updates.passwordHash ?? this.passwordHash,
      bio: updates.bio !== undefined ? updates.bio : this.bio,
      image: updates.image !== undefined ? updates.image : this.image,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
