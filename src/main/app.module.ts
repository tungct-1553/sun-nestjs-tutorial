import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from '@main/config/app.config';
import databaseConfig from '@main/config/database.config';
import { validate } from '@main/config/env.validation';
import jwtConfig from '@main/config/jwt.config';
import { DatabaseModule } from '@main/database.module';
import { AuthApiModule } from '@main/modules/auth/auth.api.module';
import { HealthApiModule } from '@main/modules/health/health.api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      validate,
    }),
    DatabaseModule.forRoot(),
    HealthApiModule,
    AuthApiModule,
  ],
})
export class AppModule {}
