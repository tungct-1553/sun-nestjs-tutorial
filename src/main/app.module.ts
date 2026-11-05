import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import appConfig from '@main/config/app.config';
import databaseConfig from '@main/config/database.config';
import { validate } from '@main/config/env.validation';
import i18nConfig from '@main/config/i18n.config';
import jwtConfig from '@main/config/jwt.config';
import swaggerConfig from '@main/config/swagger.config';
import { DatabaseModule } from '@main/database.module';
import { I18nAppModule } from '@main/i18n.module';
import { ArticlesApiModule } from '@main/modules/articles/articles.api.module';
import { AuthApiModule } from '@main/modules/auth/auth.api.module';
import { HealthApiModule } from '@main/modules/health/health.api.module';
import { AllExceptionsFilter } from '@presentation/api/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, i18nConfig, swaggerConfig],
      validate,
    }),
    I18nAppModule,
    DatabaseModule.forRoot(),
    HealthApiModule,
    AuthApiModule,
    ArticlesApiModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
