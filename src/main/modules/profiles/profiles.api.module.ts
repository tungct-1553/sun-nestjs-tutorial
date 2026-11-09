import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FOLLOW_REPOSITORY,
  PROFILE_PORT,
  USER_REPOSITORY,
} from '@application/ports/tokens';
import { FollowRepositoryPort } from '@application/ports/outbound/profile/follow.repository.port';
import { UserRepositoryPort } from '@application/ports/outbound/user/user.repository.port';
import { ProfileUseCase } from '@application/use-cases/profile/profile.use-case';
import { UserFollowEntity } from '@infrastructure/entities/user-follow.entity';
import { FollowRepository } from '@infrastructure/repositories/follow.repository';
import { AuthCoreModule } from '@main/modules/auth/auth.core.module';
import { ProfilesController } from '@presentation/api/controllers/profiles.controller';
import { OptionalJwtAuthGuard } from '@presentation/api/guards/optional-jwt-auth.guard';
import { JwtStrategy } from '@presentation/api/strategies/jwt.strategy';

@Module({
  imports: [AuthCoreModule, TypeOrmModule.forFeature([UserFollowEntity])],
  controllers: [ProfilesController],
  providers: [
    JwtStrategy,
    OptionalJwtAuthGuard,
    { provide: FOLLOW_REPOSITORY, useClass: FollowRepository },
    {
      provide: PROFILE_PORT,
      useFactory: (users: UserRepositoryPort, follows: FollowRepositoryPort) =>
        new ProfileUseCase(users, follows),
      inject: [USER_REPOSITORY, FOLLOW_REPOSITORY],
    },
  ],
})
export class ProfilesApiModule {}
