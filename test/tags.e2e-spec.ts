import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { LIST_TAGS_PORT } from '@application/ports/tokens';
import { ListTagsUseCase } from '@application/use-cases/tag/list-tags.use-case';
import { TagsController } from '@presentation/api/controllers/tags.controller';

describe('TagsController (HTTP)', () => {
  let app: INestApplication<App>;
  const tags: string[] = [];

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        {
          provide: LIST_TAGS_PORT,
          useValue: new ListTagsUseCase({
            findAll: () => Promise.resolve(tags),
          }),
        },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => app.close());

  it('returns an empty list without authentication', async () => {
    await request(app.getHttpServer())
      .get('/api/tags')
      .expect(200)
      .expect({ tags: [] });
  });

  it('returns the tag names in the expected response format', async () => {
    tags.push('nestjs', 'typescript');
    await request(app.getHttpServer())
      .get('/api/tags')
      .expect(200)
      .expect({ tags: ['nestjs', 'typescript'] });
  });
});
