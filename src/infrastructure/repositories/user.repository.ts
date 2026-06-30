import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUserInput,
  UpdateUserInput,
  UserRepositoryPort,
} from '@application/ports/outbound/user/user.repository.port';
import { User } from '@domain/models/user';
import { mapUserPersistenceError } from '@infrastructure/database/errors/database-error.mapper';
import { UserEntity } from '@infrastructure/entities/user.entity';
import { toDomainUser } from '@infrastructure/mappers/user.mapper';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? toDomainUser(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? toDomainUser(entity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { username } });
    return entity ? toDomainUser(entity) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    try {
      const entity = this.repository.create({
        email: input.email,
        username: input.username,
        password: input.passwordHash,
      });
      const saved = await this.repository.save(entity);
      return toDomainUser(saved);
    } catch (error) {
      return mapUserPersistenceError(error);
    }
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    try {
      const entity = await this.repository.findOneOrFail({ where: { id } });

      if (input.email !== undefined) {
        entity.email = input.email;
      }
      if (input.username !== undefined) {
        entity.username = input.username;
      }
      if (input.passwordHash !== undefined) {
        entity.password = input.passwordHash;
      }
      if (input.bio !== undefined) {
        entity.bio = input.bio;
      }
      if (input.image !== undefined) {
        entity.image = input.image;
      }

      const saved = await this.repository.save(entity);
      return toDomainUser(saved);
    } catch (error) {
      return mapUserPersistenceError(error);
    }
  }
}
