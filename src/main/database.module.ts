import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmModuleOptions } from '@infrastructure/database/typeorm.config';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    if (process.env.NODE_ENV === 'test') {
      return { module: DatabaseModule };
    }

    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) =>
            buildTypeOrmModuleOptions({
              database: {
                host: configService.getOrThrow<string>('database.host'),
                port: configService.getOrThrow<number>('database.port'),
                username: configService.getOrThrow<string>('database.username'),
                password: configService.getOrThrow<string>('database.password'),
                database: configService.getOrThrow<string>('database.database'),
              },
              runtime: {
                nodeEnv: configService.getOrThrow<string>('app.nodeEnv'),
              },
            }),
        }),
      ],
    };
  }
}
