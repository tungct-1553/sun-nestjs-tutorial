import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { buildTypeOrmOptions } from './typeorm.config';

config();

export default new DataSource(
  buildTypeOrmOptions({
    database: {
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_DATABASE ?? 'conduit',
    },
    runtime: {
      nodeEnv: process.env.NODE_ENV ?? 'development',
    },
  }),
);
