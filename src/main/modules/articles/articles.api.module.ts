import { Module } from '@nestjs/common';
import { ArticlesController } from '@presentation/api/controllers/articles.controller';
import { JwtStrategy } from '@presentation/api/strategies/jwt.strategy';
import { OptionalJwtAuthGuard } from '@presentation/api/guards/optional-jwt-auth.guard';
import { AuthCoreModule } from '@main/modules/auth/auth.core.module';
import { ArticlesCoreModule } from '@main/modules/articles/articles.core.module';

@Module({
  imports: [ArticlesCoreModule, AuthCoreModule],
  controllers: [ArticlesController],
  providers: [JwtStrategy, OptionalJwtAuthGuard],
})
export class ArticlesApiModule {}