import { FavoriteArticleUseCase } from '@application/use-cases/article/favorite-article.use-case';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateArticleUseCase } from '@application/use-cases/article/create-article.use-case';
import { DeleteArticleUseCase } from '@application/use-cases/article/delete-article.use-case';
import { GetArticleUseCase } from '@application/use-cases/article/get-article.use-case';
import { ListArticlesUseCase } from '@application/use-cases/article/list-articles.use-case';
import { UpdateArticleUseCase } from '@application/use-cases/article/update-article.use-case';
import {
  ARTICLE_REPOSITORY,
  FAVORITE_ARTICLE_PORT,
  CREATE_ARTICLE_PORT,
  DELETE_ARTICLE_PORT,
  GET_ARTICLE_PORT,
  LIST_ARTICLES_PORT,
  UPDATE_ARTICLE_PORT,
} from '@application/ports/tokens';
import { ArticleFavoriteEntity } from '@infrastructure/entities/article-favorite.entity';
import { ArticleEntity } from '@infrastructure/entities/article.entity';
import { TagEntity } from '@infrastructure/entities/tag.entity';
import { ArticleRepository } from '@infrastructure/repositories/article.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleEntity, TagEntity, ArticleFavoriteEntity]),
  ],
  providers: [
    {
      provide: FAVORITE_ARTICLE_PORT,
      useFactory: (repository: ArticleRepository) =>
        new FavoriteArticleUseCase(repository),
      inject: [ARTICLE_REPOSITORY],
    },
    {
      provide: ARTICLE_REPOSITORY,
      useClass: ArticleRepository,
    },
    {
      provide: CREATE_ARTICLE_PORT,
      useFactory: (articleRepository: ArticleRepository) =>
        new CreateArticleUseCase(articleRepository),
      inject: [ARTICLE_REPOSITORY],
    },
    {
      provide: GET_ARTICLE_PORT,
      useFactory: (articleRepository: ArticleRepository) =>
        new GetArticleUseCase(articleRepository),
      inject: [ARTICLE_REPOSITORY],
    },
    {
      provide: LIST_ARTICLES_PORT,
      useFactory: (articleRepository: ArticleRepository) =>
        new ListArticlesUseCase(articleRepository),
      inject: [ARTICLE_REPOSITORY],
    },
    {
      provide: UPDATE_ARTICLE_PORT,
      useFactory: (articleRepository: ArticleRepository) =>
        new UpdateArticleUseCase(articleRepository),
      inject: [ARTICLE_REPOSITORY],
    },
    {
      provide: DELETE_ARTICLE_PORT,
      useFactory: (articleRepository: ArticleRepository) =>
        new DeleteArticleUseCase(articleRepository),
      inject: [ARTICLE_REPOSITORY],
    },
  ],
  exports: [
    FAVORITE_ARTICLE_PORT,
    ARTICLE_REPOSITORY,
    CREATE_ARTICLE_PORT,
    GET_ARTICLE_PORT,
    LIST_ARTICLES_PORT,
    UPDATE_ARTICLE_PORT,
    DELETE_ARTICLE_PORT,
  ],
})
export class ArticlesCoreModule {}
