import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ARTICLE_REPOSITORY,
  COMMENT_REPOSITORY,
  CREATE_COMMENT_PORT,
  LIST_COMMENTS_PORT,
  DELETE_COMMENT_PORT,
} from '@application/ports/tokens';
import { ArticleRepositoryPort } from '@application/ports/outbound/article/article.repository.port';
import { CommentRepositoryPort } from '@application/ports/outbound/comment/comment.repository.port';
import { CreateCommentUseCase } from '@application/use-cases/comment/create-comment.use-case';
import { ListCommentsUseCase } from '@application/use-cases/comment/list-comments.use-case';
import { DeleteCommentUseCase } from '@application/use-cases/comment/delete-comment.use-case';
import { CommentEntity } from '@infrastructure/entities/comment.entity';
import { CommentRepository } from '@infrastructure/repositories/comment.repository';
import { ArticlesCoreModule } from '@main/modules/articles/articles.core.module';

@Module({
  imports: [ArticlesCoreModule, TypeOrmModule.forFeature([CommentEntity])],
  providers: [
    { provide: COMMENT_REPOSITORY, useClass: CommentRepository },
    {
      provide: CREATE_COMMENT_PORT,
      useFactory: (a: ArticleRepositoryPort, c: CommentRepositoryPort) =>
        new CreateCommentUseCase(a, c),
      inject: [ARTICLE_REPOSITORY, COMMENT_REPOSITORY],
    },
    {
      provide: LIST_COMMENTS_PORT,
      useFactory: (a: ArticleRepositoryPort, c: CommentRepositoryPort) =>
        new ListCommentsUseCase(a, c),
      inject: [ARTICLE_REPOSITORY, COMMENT_REPOSITORY],
    },
    {
      provide: DELETE_COMMENT_PORT,
      useFactory: (a: ArticleRepositoryPort, c: CommentRepositoryPort) =>
        new DeleteCommentUseCase(a, c),
      inject: [ARTICLE_REPOSITORY, COMMENT_REPOSITORY],
    },
  ],
  exports: [CREATE_COMMENT_PORT, LIST_COMMENTS_PORT, DELETE_COMMENT_PORT],
})
export class CommentsCoreModule {}
