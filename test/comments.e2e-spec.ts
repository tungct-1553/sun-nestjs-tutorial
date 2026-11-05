import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  CREATE_COMMENT_PORT,
  DELETE_COMMENT_PORT,
  LIST_COMMENTS_PORT,
} from '@application/ports/tokens';
import { CommentsController } from '@presentation/api/controllers/comments.controller';
import { JwtAuthGuard } from '@presentation/api/guards/jwt-auth.guard';

describe('CommentsController (e2e)', () => {
  let app: INestApplication<App>;
  let userId: string | null;
  const create = { execute: jest.fn() };
  const list = { execute: jest.fn() };
  const remove = { execute: jest.fn() };
  const id = 'f1b15205-7fea-4438-8a91-0a39a6d5b157';
  const comment = {
    id,
    body: 'Great!',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    author: { username: 'jake', bio: null, image: null, following: false },
  };
  beforeEach(async () => {
    jest.resetAllMocks();
    userId = 'user-1';
    const module = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        { provide: CREATE_COMMENT_PORT, useValue: create },
        { provide: LIST_COMMENTS_PORT, useValue: list },
        { provide: DELETE_COMMENT_PORT, useValue: remove },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          if (!userId) return false;
          ctx.switchToHttp().getRequest<{ user: { userId: string } }>().user = {
            userId,
          };
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });
  it('creates a comment with authenticated author', async () => {
    create.execute.mockResolvedValue(comment);
    const response = await request(app.getHttpServer())
      .post('/api/articles/slug/comments')
      .send({ comment: { body: 'Great!' } })
      .expect(201);
    expect(response.body).toEqual({ comment });
    expect(create.execute).toHaveBeenCalledWith('slug', 'user-1', 'Great!');
  });
  it('lists comments without authentication', async () => {
    userId = null;
    list.execute.mockResolvedValue([comment]);
    const response = await request(app.getHttpServer())
      .get('/api/articles/slug/comments')
      .expect(200);
    expect(response.body).toEqual({ comments: [comment] });
    expect(list.execute).toHaveBeenCalledWith('slug');
  });
  it.each([
    {},
    { comment: {} },
    { comment: { body: '   ' } },
    { comment: { body: 42 } },
    { comment: [] },
  ])('rejects invalid body %p', async (body) => {
    await request(app.getHttpServer())
      .post('/api/articles/slug/comments')
      .send(body)
      .expect(400);
    expect(create.execute).not.toHaveBeenCalled();
  });
  it('rejects unauthenticated create and delete', async () => {
    userId = null;
    await request(app.getHttpServer())
      .post('/api/articles/slug/comments')
      .send({ comment: { body: 'Great!' } })
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/api/articles/slug/comments/${id}`)
      .expect(403);
    expect(remove.execute).not.toHaveBeenCalled();
  });
  it('passes the article, comment and authenticated author to delete', async () => {
    await request(app.getHttpServer())
      .delete(`/api/articles/slug/comments/${id}`)
      .expect(200);
    expect(remove.execute).toHaveBeenCalledWith('slug', id, 'user-1');
  });
  it('rejects invalid comment identifiers', async () => {
    await request(app.getHttpServer())
      .delete('/api/articles/slug/comments/invalid')
      .expect(400);
    expect(remove.execute).not.toHaveBeenCalled();
  });
});
