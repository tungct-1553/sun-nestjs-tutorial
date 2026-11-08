import { Module } from '@nestjs/common';
import { AuthCoreModule } from '@main/modules/auth/auth.core.module';
import { CommentsCoreModule } from '@main/modules/comments/comments.core.module';
import { CommentsController } from '@presentation/api/controllers/comments.controller';
import { JwtStrategy } from '@presentation/api/strategies/jwt.strategy';

@Module({
  imports: [CommentsCoreModule, AuthCoreModule],
  controllers: [CommentsController],
  providers: [JwtStrategy],
})
export class CommentsApiModule {}
