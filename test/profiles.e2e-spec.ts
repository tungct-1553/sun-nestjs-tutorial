import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PROFILE_PORT, USER_REPOSITORY } from '@application/ports/tokens';
import { ProfileUseCase } from '@application/use-cases/profile/profile.use-case';
import { UserRepositoryPort } from '@application/ports/outbound/user/user.repository.port';
import { FollowRepositoryPort } from '@application/ports/outbound/profile/follow.repository.port';
import { User } from '@domain/models/user';
import { AllExceptionsFilter } from '@presentation/api/filters/all-exceptions.filter';
import { ProfilesController } from '@presentation/api/controllers/profiles.controller';
import { JwtStrategy } from '@presentation/api/strategies/jwt.strategy';
import { OptionalJwtAuthGuard } from '@presentation/api/guards/optional-jwt-auth.guard';

describe('ProfilesController (HTTP)', () => {
  let app: INestApplication<App>;
  let token: string;
  let followed: boolean;
  const user = (id: string, username: string) =>
    new User({
      id,
      username,
      email: `${username}@example.test`,
      passwordHash: 'private-hash',
      bio: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  const viewer = user('viewer-id', 'viewer');
  const target = user('target-id', 'target');

  beforeAll(async () => {
    const users = {
      findById: jest.fn((id: string) =>
        Promise.resolve(id === viewer.id ? viewer : null),
      ),
      findByUsername: jest.fn((username: string) =>
        Promise.resolve(
          username === target.username
            ? target
            : username === viewer.username
              ? viewer
              : null,
        ),
      ),
    } as unknown as UserRepositoryPort;
    const follows: FollowRepositoryPort = {
      isFollowing: jest.fn(() => Promise.resolve(followed)),
      follow: jest.fn(() => {
        followed = true;
        return Promise.resolve();
      }),
      unfollow: jest.fn(() => {
        followed = false;
        return Promise.resolve();
      }),
    };
    const module = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ProfilesController],
      providers: [
        JwtStrategy,
        OptionalJwtAuthGuard,
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => 'local-test-secret' },
        },
        { provide: USER_REPOSITORY, useValue: users },
        { provide: PROFILE_PORT, useValue: new ProfileUseCase(users, follows) },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(
      new AllExceptionsFilter({
        translate: (key: string) => key,
      } as I18nService),
    );
    await app.init();
    token = new JwtService({ secret: 'local-test-secret' }).sign({
      sub: viewer.id,
    });
  });

  beforeEach(() => {
    followed = false;
  });
  afterAll(async () => {
    await app.close();
  });

  it('gets public profile and keeps private fields out', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/profiles/target')
      .expect(200);
    expect(response.body).toEqual({
      profile: { username: 'target', bio: null, image: null, following: false },
    });
  });

  it('rejects anonymous follow and unfollow', async () => {
    await request(app.getHttpServer())
      .post('/api/profiles/target/follow')
      .expect(401);
    await request(app.getHttpServer())
      .delete('/api/profiles/target/follow')
      .expect(401);
  });

  it('uses the real JWT guard to follow, view and unfollow', async () => {
    const server = app.getHttpServer();
    const auth = `Token ${token}`;
    const first = await request(server)
      .post('/api/profiles/target/follow')
      .set('Authorization', auth)
      .expect(200);
    expect(
      (first.body as { profile: { following: boolean } }).profile.following,
    ).toBe(true);
    const profile = await request(server)
      .get('/api/profiles/target')
      .set('Authorization', auth)
      .expect(200);
    expect(
      (profile.body as { profile: { following: boolean } }).profile.following,
    ).toBe(true);
    const last = await request(server)
      .delete('/api/profiles/target/follow')
      .set('Authorization', auth)
      .expect(200);
    expect(
      (last.body as { profile: { following: boolean } }).profile.following,
    ).toBe(false);
  });
  it('maps unknown users to HTTP 404', async () => {
    await request(app.getHttpServer()).get('/api/profiles/missing').expect(404);
    await request(app.getHttpServer())
      .post('/api/profiles/missing/follow')
      .set('Authorization', `Token ${token}`)
      .expect(404);
  });

  it('rejects following yourself with HTTP 400', async () => {
    await request(app.getHttpServer())
      .post('/api/profiles/viewer/follow')
      .set('Authorization', `Token ${token}`)
      .expect(400);
  });
});
