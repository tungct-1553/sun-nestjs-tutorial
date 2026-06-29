import { User } from '@domain/models/user';
import { UserEntity } from '@infrastructure/entities/user.entity';

export const toDomainUser = (entity: UserEntity): User =>
  new User({
    id: entity.id,
    email: entity.email,
    username: entity.username,
    passwordHash: entity.password,
    bio: entity.bio,
    image: entity.image,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
