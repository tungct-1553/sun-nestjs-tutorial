import { Module } from '@nestjs/common';
import { UserController } from '@presentation/api/controllers/user.controller';
import { UsersController } from '@presentation/api/controllers/users.controller';
import { JwtStrategy } from '@presentation/api/strategies/jwt.strategy';
import { AuthCoreModule } from '@main/modules/auth/auth.core.module';

@Module({
  imports: [AuthCoreModule],
  controllers: [UsersController, UserController],
  providers: [JwtStrategy],
})
export class AuthApiModule {}
