import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { DatabaseConnectionConfig } from './types/database-connection.config';

export interface TypeOrmRuntimeOptions {
  nodeEnv: string;
}

export interface TypeOrmConfigInput {
  database: DatabaseConnectionConfig;
  runtime: TypeOrmRuntimeOptions;
}

export const buildTypeOrmOptions = (
  input: TypeOrmConfigInput,
): DataSourceOptions => ({
  type: 'postgres',
  host: input.database.host,
  port: input.database.port,
  username: input.database.username,
  password: input.database.password,
  database: input.database.database,
  synchronize: false,
  migrations: [join(__dirname, 'migrations/*.{ts,js}')],
  migrationsRun: input.runtime.nodeEnv === 'production',
  logging: input.runtime.nodeEnv === 'development',
  extra: {
    connectionTimeoutMillis: 5_000,
  },
});

export const buildTypeOrmModuleOptions = (
  input: TypeOrmConfigInput,
): TypeOrmModuleOptions => ({
  ...buildTypeOrmOptions(input),
  autoLoadEntities: true,
  retryAttempts: 3,
  retryDelay: 2_000,
});
