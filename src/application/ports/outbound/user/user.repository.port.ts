import { User } from '@domain/models/user';

export interface CreateUserInput {
  email: string;
  username: string;
  passwordHash: string;
}

export interface UpdateUserInput {
  email?: string;
  username?: string;
  passwordHash?: string;
  bio?: string | null;
  image?: string | null;
}

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User>;
}
