import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetCurrentUserUseCase } from '@application/use-cases/auth/get-current-user.use-case';
import { LoginUserUseCase } from '@application/use-cases/auth/login-user.use-case';
import { RegisterUserUseCase } from '@application/use-cases/auth/register-user.use-case';
import { UpdateUserUseCase } from '@application/use-cases/auth/update-user.use-case';
import {
  GET_CURRENT_USER_PORT,
  LOGIN_USER_PORT,
  PASSWORD_HASHER,
  REGISTER_USER_PORT,
  TOKEN_SERVICE,
  UPDATE_USER_PORT,
  USER_REPOSITORY,
} from '@application/ports/tokens';
import { UserEntity } from '@infrastructure/entities/user.entity';
import { BcryptPasswordHasher } from '@infrastructure/external-services/bcrypt-password-hasher.service';
import { JwtTokenService } from '@infrastructure/external-services/jwt-token.service';
import { UserRepository } from '@infrastructure/repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    {
      provide: REGISTER_USER_PORT,
      useFactory: (
        userRepository: UserRepository,
        passwordHasher: BcryptPasswordHasher,
        tokenService: JwtTokenService,
      ) =>
        new RegisterUserUseCase(userRepository, passwordHasher, tokenService),
      inject: [USER_REPOSITORY, PASSWORD_HASHER, TOKEN_SERVICE],
    },
    {
      provide: LOGIN_USER_PORT,
      useFactory: (
        userRepository: UserRepository,
        passwordHasher: BcryptPasswordHasher,
        tokenService: JwtTokenService,
      ) => new LoginUserUseCase(userRepository, passwordHasher, tokenService),
      inject: [USER_REPOSITORY, PASSWORD_HASHER, TOKEN_SERVICE],
    },
    {
      provide: GET_CURRENT_USER_PORT,
      useFactory: (userRepository: UserRepository) =>
        new GetCurrentUserUseCase(userRepository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: UPDATE_USER_PORT,
      useFactory: (
        userRepository: UserRepository,
        passwordHasher: BcryptPasswordHasher,
      ) => new UpdateUserUseCase(userRepository, passwordHasher),
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
  ],
  exports: [
    USER_REPOSITORY,
    REGISTER_USER_PORT,
    LOGIN_USER_PORT,
    GET_CURRENT_USER_PORT,
    UPDATE_USER_PORT,
  ],
})
export class AuthCoreModule {}
