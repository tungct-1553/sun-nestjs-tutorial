import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LIST_TAGS_PORT, TAG_REPOSITORY } from '@application/ports/tokens';
import { TagRepositoryPort } from '@application/ports/outbound/tag/tag.repository.port';
import { ListTagsUseCase } from '@application/use-cases/tag/list-tags.use-case';
import { TagEntity } from '@infrastructure/entities/tag.entity';
import { TagRepository } from '@infrastructure/repositories/tag.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity])],
  providers: [
    { provide: TAG_REPOSITORY, useClass: TagRepository },
    {
      provide: LIST_TAGS_PORT,
      useFactory: (repository: TagRepositoryPort) =>
        new ListTagsUseCase(repository),
      inject: [TAG_REPOSITORY],
    },
  ],
  exports: [LIST_TAGS_PORT],
})
export class TagsCoreModule {}
