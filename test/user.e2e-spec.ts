import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  GET_CURRENT_USER_PORT,
  UPDATE_USER_PORT,
} from '@application/ports/tokens';
import { DuplicateUsernameException } from '@domain/exceptions/duplicate-username.exception';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';
import { UserController } from '@presentation/api/controllers/user.controller';
import { AllExceptionsFilter } from '@presentation/api/filters/all-exceptions.filter';
import { JwtAuthGuard } from '@presentation/api/guards/jwt-auth.guard';

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;
  let authenticatedUserId: string | null = 'user-1';

  const getCurrentUserPort = {
    execute: jest.fn(),
  };

  const updateUserPort = {
    execute: jest.fn(),
  };

  const jwtAuthGuard = {
    canActivate: (context: ExecutionContext): boolean => {
      if (!authenticatedUserId) {
        return false;
      }

      const request = context.switchToHttp().getRequest<{ user?: { userId: string } }>();
      request.user = { userId: authenticatedUserId };
      return true;
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    authenticatedUserId = 'user-1';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: GET_CURRENT_USER_PORT, useValue: getCurrentUserPort },
        { provide: UPDATE_USER_PORT, useValue: updateUserPort },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/user returns current user', async () => {
    getCurrentUserPort.execute.mockResolvedValue({
      email: 'jake@jake.jake',
      username: 'jake',
      bio: null,
      image: null,
    });

    const response = await request(app.getHttpServer())
      .get('/api/user')
      .set('Authorization', 'Token jwt.token')
      .expect(200);

    const body = response.body as {
      user: { email: string; username: string; bio: string | null; image: string | null };
    };
    expect(body.user).toEqual({
      email: 'jake@jake.jake',
      username: 'jake',
      bio: null,
      image: null,
    });
    expect(getCurrentUserPort.execute.mock.calls[0]?.[0]).toBe('user-1');
  });

  it('GET /api/user maps user not found to 404', async () => {
    getCurrentUserPort.execute.mockRejectedValue(new UserNotFoundException());

    const response = await request(app.getHttpServer())
      .get('/api/user')
      .set('Authorization', 'Token jwt.token')
      .expect(404);

    const body = response.body as { errors: Record<string, string[]> };
    expect(body.errors.error).toContain('User not found');
  });

  it('GET /api/user returns 403 when not authenticated', () => {
    authenticatedUserId = null;

    return request(app.getHttpServer()).get('/api/user').expect(403);
  });

  it('PUT /api/user updates and returns user', async () => {
    updateUserPort.execute.mockResolvedValue({
      email: 'new@new.new',
      username: 'newjake',
      bio: 'bio',
      image: 'image',
    });

    const response = await request(app.getHttpServer())
      .put('/api/user')
      .set('Authorization', 'Token jwt.token')
      .send({
        user: {
          email: 'new@new.new',
          username: 'newjake',
          bio: 'bio',
          image: 'image',
        },
      })
      .expect(200);

    const body = response.body as {
      user: { email: string; username: string; bio: string; image: string };
    };
    expect(body.user).toEqual({
      email: 'new@new.new',
      username: 'newjake',
      bio: 'bio',
      image: 'image',
    });
    expect(updateUserPort.execute.mock.calls[0]?.[0]).toEqual({
      userId: 'user-1',
      email: 'new@new.new',
      username: 'newjake',
      password: undefined,
      bio: 'bio',
      image: 'image',
    });
  });

  it('PUT /api/user returns 400 when user object is missing', () => {
    return request(app.getHttpServer())
      .put('/api/user')
      .set('Authorization', 'Token jwt.token')
      .send({ email: 'new@new.new' })
      .expect(400);
  });

  it('PUT /api/user returns 400 when email is null', () => {
    return request(app.getHttpServer())
      .put('/api/user')
      .set('Authorization', 'Token jwt.token')
      .send({ user: { email: null } })
      .expect(400);
  });

  it('PUT /api/user maps duplicate username to 422', async () => {
    updateUserPort.execute.mockRejectedValue(new DuplicateUsernameException());

    const response = await request(app.getHttpServer())
      .put('/api/user')
      .set('Authorization', 'Token jwt.token')
      .send({ user: { username: 'taken' } })
      .expect(422);

    const body = response.body as { errors: Record<string, string[]> };
    expect(body.errors.error).toContain('Username is already taken');
  });

  it('PUT /api/user returns 403 when not authenticated', () => {
    authenticatedUserId = null;

    return request(app.getHttpServer())
      .put('/api/user')
      .send({ user: { bio: 'bio' } })
      .expect(403);
  });
});