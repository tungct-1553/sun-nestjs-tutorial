import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { I18nService } from 'nestjs-i18n';
import { App } from 'supertest/types';
import {
  CREATE_ARTICLE_PORT,
  FAVORITE_ARTICLE_PORT,
  DELETE_ARTICLE_PORT,
  GET_ARTICLE_PORT,
  LIST_ARTICLES_PORT,
  UPDATE_ARTICLE_PORT,
} from '@application/ports/tokens';
import { ArticleForbiddenException } from '@domain/exceptions/article-forbidden.exception';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';
import { ArticlesController } from '@presentation/api/controllers/articles.controller';
import { AllExceptionsFilter } from '@presentation/api/filters/all-exceptions.filter';
import { JwtAuthGuard } from '@presentation/api/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '@presentation/api/guards/optional-jwt-auth.guard';

describe('ArticlesController (e2e)', () => {
  let app: INestApplication<App>;
  let authenticated = true;
  const create = { execute: jest.fn() };
  const get = { execute: jest.fn() };
  const list = { execute: jest.fn() };
  const update = { execute: jest.fn() };
  const favorite = { execute: jest.fn() };
  const remove = { execute: jest.fn() };
  const article = {
    slug: 'example',
    title: 'Example',
    description: 'Description',
    body: 'Body',
    tagList: ['one', 'two'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    favorited: false,
    favoritesCount: 0,
    author: { username: 'jake', bio: null, image: null, following: false },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    authenticated = true;
    const guard = {
      canActivate: (context: ExecutionContext) => {
        if (!authenticated) return false;
        context.switchToHttp().getRequest<{ user: { userId: string } }>().user =
          { userId: 'user-1' };
        return true;
      },
    };
    const module = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        { provide: CREATE_ARTICLE_PORT, useValue: create },
        { provide: FAVORITE_ARTICLE_PORT, useValue: favorite },
        { provide: GET_ARTICLE_PORT, useValue: get },
        { provide: LIST_ARTICLES_PORT, useValue: list },
        { provide: UPDATE_ARTICLE_PORT, useValue: update },
        { provide: DELETE_ARTICLE_PORT, useValue: remove },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(guard)
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(
      new AllExceptionsFilter({
        translate: (key: string) => key,
      } as unknown as I18nService),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('lists articles with filters and pagination', async () => {
    list.execute.mockResolvedValue({ articles: [article], articlesCount: 1 });
    const response = await request(app.getHttpServer())
      .get('/api/articles?tag=one&limit=5&offset=2')
      .expect(200);
    expect(response.body).toMatchObject({
      articles: [{ slug: 'example', tagList: ['one', 'two'] }],
      articlesCount: 1,
    });
    expect(list.execute).toHaveBeenCalledWith({
      tag: 'one',
      limit: 5,
      offset: 2,
    });
  });

  it('routes feed before slug, applies pagination and requires authentication', async () => {
    list.execute.mockResolvedValue({ articles: [article], articlesCount: 1 });
    await request(app.getHttpServer())
      .get('/api/articles/feed?limit=5&offset=2')
      .expect(200);
    expect(list.execute).toHaveBeenCalledWith({
      limit: 5,
      offset: 2,
      followedById: 'user-1',
      viewerId: 'user-1',
    });
    expect(get.execute).not.toHaveBeenCalled();
    await request(app.getHttpServer())
      .get('/api/articles/feed?limit=-1')
      .expect(400);
    await request(app.getHttpServer())
      .get('/api/articles/feed?followedById=other')
      .expect(400);
    authenticated = false;
    await request(app.getHttpServer()).get('/api/articles/feed').expect(403);
  });

  it('gets an article and returns 404 when missing', async () => {
    get.execute
      .mockResolvedValueOnce(article)
      .mockRejectedValueOnce(new ArticleNotFoundException());
    const response = await request(app.getHttpServer())
      .get('/api/articles/example')
      .expect(200);
    expect(response.body).toMatchObject({
      article: { slug: 'example', body: 'Body' },
    });
    await request(app.getHttpServer()).get('/api/articles/missing').expect(404);
  });

  it('creates an article for the authenticated user and rejects invalid input', async () => {
    create.execute.mockResolvedValue(article);
    await request(app.getHttpServer())
      .post('/api/articles')
      .send({
        article: { title: 'Example', description: 'Description', body: 'Body' },
      })
      .expect(201);
    expect(create.execute).toHaveBeenCalledWith({
      authorId: 'user-1',
      title: 'Example',
      description: 'Description',
      body: 'Body',
      tagList: undefined,
    });
    await request(app.getHttpServer())
      .post('/api/articles')
      .send({ article: { title: '' } })
      .expect(400);
  });

  it('updates and deletes articles and maps forbidden errors', async () => {
    update.execute.mockResolvedValue(article);
    await request(app.getHttpServer())
      .put('/api/articles/example')
      .send({ article: { title: 'Updated' } })
      .expect(200);
    expect(update.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: 'user-1',
        slug: 'example',
        title: 'Updated',
      }),
    );
    remove.execute
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new ArticleForbiddenException());
    await request(app.getHttpServer())
      .delete('/api/articles/example')
      .expect(200);
    expect(remove.execute).toHaveBeenCalledWith({
      authorId: 'user-1',
      slug: 'example',
    });
    await request(app.getHttpServer())
      .delete('/api/articles/example')
      .expect(403);
  });

  it('favorites and unfavorites the article as the authenticated user', async () => {
    favorite.execute.mockResolvedValue({
      ...article,
      favorited: true,
      favoritesCount: 1,
    });
    await request(app.getHttpServer())
      .post('/api/articles/example/favorite')
      .expect(200);
    expect(favorite.execute).toHaveBeenCalledWith('example', 'user-1', true);
    await request(app.getHttpServer())
      .delete('/api/articles/example/favorite')
      .expect(200);
    expect(favorite.execute).toHaveBeenCalledWith('example', 'user-1', false);
    authenticated = false;
    await request(app.getHttpServer())
      .post('/api/articles/example/favorite')
      .expect(403);
  });

  it('rejects unauthenticated writes', async () => {
    authenticated = false;
    await request(app.getHttpServer())
      .post('/api/articles')
      .send({ article: {} })
      .expect(403);
    await request(app.getHttpServer())
      .delete('/api/articles/example')
      .expect(403);
    expect(create.execute).not.toHaveBeenCalled();
    expect(remove.execute).not.toHaveBeenCalled();
  });
});
