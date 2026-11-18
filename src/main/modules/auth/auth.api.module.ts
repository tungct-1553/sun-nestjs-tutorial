import { Module } from '@nestjs/common';
import { UserController } from '@presentation/api/controllers/user.controller';
import { UsersController } from '@presentation/api/controllers/users.controller';
import { JwtStrategy } from '@presentation/api/strategies/jwt.strategy';
import { AuthCoreModule } from '@main/modules/auth/auth.core.module';
import { I18nAppModule } from '@main/i18n.module';
import { AuthValidationFilter } from '@presentation/api/filters/auth-validation.filter';

@Module({
  imports: [AuthCoreModule, I18nAppModule],
  controllers: [UsersController, UserController],
  providers: [JwtStrategy, AuthValidationFilter],
})
export class AuthApiModule {}
