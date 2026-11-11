import { randomBytes, randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { I18nValidationPipe } from 'nestjs-i18n';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';

// Run only against an explicitly configured, disposable, migrated database.
const databaseUrl = process.env.AUTH_E2E_DATABASE_URL;
const describeWithDatabase = databaseUrl ? describe : describe.skip;

describeWithDatabase('Auth and User API (PostgreSQL)', () => {
  let app: INestApplication<App>;
  let initialized = false;
  let token: string;
  const environmentKeys = [
    'NODE_ENV',
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
    'JWT_SECRET',
  ] as const;
  const originalEnvironment = Object.fromEntries(
    environmentKeys.map((key) => [key, process.env[key]]),
  );
  const suffix = randomUUID().replaceAll('-', '');
  const email = `auth-${suffix}@example.test`;
  const secondEmail = `other-${suffix}@example.test`;
  const username = `auth-${suffix}`;
  const secondUsername = `other-${suffix}`;
  const password = randomBytes(16).toString('hex');

  beforeAll(async () => {
    const database = new URL(databaseUrl!);
    if (!database.pathname.slice(1).startsWith('auth_e2e_')) {
      throw new Error(
        'AUTH_E2E_DATABASE_URL must reference an isolated auth_e2e_ database',
      );
    }
    process.env.NODE_ENV = 'production';
    process.env.DB_HOST = database.hostname;
    process.env.DB_PORT = database.port || '5432';
    process.env.DB_USERNAME = decodeURIComponent(database.username);
    process.env.DB_PASSWORD = decodeURIComponent(database.password);
    process.env.DB_DATABASE = database.pathname.slice(1);
    process.env.JWT_SECRET = randomBytes(32).toString('hex');
    const { AppModule } =
      jest.requireActual<typeof import('@main/app.module')>('@main/app.module');
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new I18nValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
    initialized = true;
  });

  afterAll(async () => {
    try {
      if (initialized) {
        await app
          .get(DataSource)
          .query('DELETE FROM users WHERE email = ANY($1::text[])', [
            [email, secondEmail],
          ]);
      }
    } finally {
      try {
        if (app) await app.close();
      } finally {
        for (const key of environmentKeys) {
          const previous = originalEnvironment[key];
          if (previous === undefined) delete process.env[key];
          else process.env[key] = previous;
        }
      }
    }
  });

  it('registers users and authenticates with a real signed JWT', async () => {
    const server = app.getHttpServer();
    const registered = await request(server)
      .post('/api/users')
      .send({ user: { email, username, password } })
      .expect(201);
    expect(
      (registered.body as { user: Record<string, unknown> }).user,
    ).toMatchObject({ email, username });
    expect(
      (registered.body as { user: Record<string, unknown> }).user.password,
    ).toBeUndefined();
    await request(server)
      .post('/api/users')
      .send({
        user: { email: secondEmail, username: secondUsername, password },
      })
      .expect(201);
    const login = await request(server)
      .post('/api/users/login')
      .send({ user: { email, password } })
      .expect(201);
    token = (login.body as { user: { token: string } }).user.token;
    expect(token).toEqual(expect.any(String));
    const current = await request(server)
      .get('/api/user')
      .set('Authorization', `Token ${token}`)
      .expect(200);
    expect(
      (current.body as { user: Record<string, unknown> }).user,
    ).toMatchObject({ email, username });
    expect(
      (current.body as { user: Record<string, unknown> }).user.password,
    ).toBeUndefined();
  });

  it('rejects missing, malformed and invalid tokens', async () => {
    const server = app.getHttpServer();
    const expired = new JwtService().sign(
      { sub: '00000000-0000-0000-0000-000000000000' },
      { secret: process.env.JWT_SECRET, expiresIn: '-1s' },
    );
    for (const header of [
      undefined,
      'Token invalid.jwt.token',
      `Token ${expired}`,
      `Bearer ${token}`,
    ]) {
      const call = request(server).get('/api/user');
      if (header) call.set('Authorization', header);
      const response = await call.expect(401);
      expect(
        (response.body as { errors: Record<string, string[]> }).errors,
      ).toBeDefined();
    }
  });

  it('rejects invalid registration, duplicate email and wrong credentials with error responses', async () => {
    const server = app.getHttpServer();
    const invalid = await request(server)
      .post('/api/users')
      .send({ user: { email: 'bad', username: 'x', password } })
      .expect(422);
    expect(
      (invalid.body as { errors: Record<string, string[]> }).errors[
        'user.email'
      ],
    ).toEqual(expect.any(Array));
    const duplicate = await request(server)
      .post('/api/users')
      .send({ user: { email, username: `new-${suffix}`, password } })
      .expect(422);
    expect(
      (duplicate.body as { errors: Record<string, string[]> }).errors.error,
    ).toEqual(expect.any(Array));
    const wrong = await request(server)
      .post('/api/users/login')
      .send({ user: { email, password: 'wrong-password' } })
      .expect(403);
    expect(
      (wrong.body as { errors: Record<string, string[]> }).errors.error,
    ).toEqual(expect.any(Array));
  });

  it('updates the current user and rejects duplicate or invalid updates', async () => {
    const server = app.getHttpServer();
    const auth = `Token ${token}`;
    const updated = await request(server)
      .put('/api/user')
      .set('Authorization', auth)
      .send({ user: { bio: 'Updated bio' } })
      .expect(200);
    expect((updated.body as { user: Record<string, unknown> }).user.bio).toBe(
      'Updated bio',
    );
    const duplicate = await request(server)
      .put('/api/user')
      .set('Authorization', auth)
      .send({ user: { username: secondUsername } })
      .expect(422);
    expect(
      (duplicate.body as { errors: Record<string, string[]> }).errors.error,
    ).toEqual(expect.any(Array));
    const invalid = await request(server)
      .put('/api/user')
      .set('Authorization', auth)
      .send({ user: { email: null } })
      .expect(422);
    expect(
      (invalid.body as { errors: Record<string, string[]> }).errors[
        'user.email'
      ],
    ).toEqual(expect.any(Array));
  });

  it('returns translated field errors without including submitted values', async () => {
    const secret = 'secret-not-to-be-returned';
    const server = app.getHttpServer();
    const english = await request(server)
      .post('/api/users')
      .send({
        user: { email: 'invalid-email', username: '', password: secret },
      })
      .expect(422);
    const englishErrors = (english.body as { errors: Record<string, string[]> })
      .errors;
    expect(englishErrors['user.email']).toContain(
      'Email must be a valid email address',
    );
    expect(englishErrors['user.username']).toContain(
      'Username must not be empty',
    );
    expect(JSON.stringify(english.body)).not.toContain(secret);
    expect(JSON.stringify(english.body)).not.toContain('invalid-email');

    const vietnamese = await request(server)
      .post('/api/users/login?lang=vi')
      .send({ user: { email: 'invalid-email', password: '' } })
      .expect(422);
    const vietnameseErrors = (
      vietnamese.body as { errors: Record<string, string[]> }
    ).errors;
    expect(vietnameseErrors['user.email']).toContain(
      'Email phải là địa chỉ email hợp lệ',
    );
    expect(vietnameseErrors['user.password']).toContain(
      'Mật khẩu không được để trống',
    );
  });

  it('keeps malformed JSON and non-auth validation errors at 400', async () => {
    const server = app.getHttpServer();
    await request(server)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send('{bad json')
      .expect(400);
    await request(server).get('/api/articles?limit=-1').expect(400);
  });

  it('returns field errors for missing user body and invalid update', async () => {
    const server = app.getHttpServer();
    const missing = await request(server)
      .post('/api/users/login')
      .send({})
      .expect(422);
    expect(
      (missing.body as { errors: Record<string, string[]> }).errors.user,
    ).toEqual(expect.any(Array));
    const updated = await request(server)
      .put('/api/user')
      .set('Authorization', `Token ${token}`)
      .send({ user: { email: null, username: '', password: '' } })
      .expect(422);
    const errors = (updated.body as { errors: Record<string, string[]> })
      .errors;
    expect(errors['user.email']).toEqual(expect.any(Array));
    expect(errors['user.username']).toEqual(expect.any(Array));
    expect(errors['user.password']).toEqual(expect.any(Array));
  });
});
