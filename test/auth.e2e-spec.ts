import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  LOGIN_USER_PORT,
  REGISTER_USER_PORT,
} from '@application/ports/tokens';
import { DuplicateEmailException } from '@domain/exceptions/duplicate-email.exception';
import { InvalidCredentialsException } from '@domain/exceptions/invalid-credentials.exception';
import { UsersController } from '@presentation/api/controllers/users.controller';
import { AllExceptionsFilter } from '@presentation/api/filters/all-exceptions.filter';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;

  const registerUserPort = {
    execute: jest.fn(),
  };

  const loginUserPort = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: REGISTER_USER_PORT, useValue: registerUserPort },
        { provide: LOGIN_USER_PORT, useValue: loginUserPort },
      ],
    }).compile();

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

  it('POST /api/users returns 400 when user object is missing', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .send({ email: 'jake@jake.jake' })
      .expect(400);
  });

  it('POST /api/users/login returns 400 when user object is missing', () => {
    return request(app.getHttpServer())
      .post('/api/users/login')
      .send({ email: 'jake@jake.jake' })
      .expect(400);
  });

  it('POST /api/users maps duplicate email to 422', async () => {
    registerUserPort.execute.mockRejectedValue(new DuplicateEmailException());

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send({
        user: {
          email: 'jake@jake.jake',
          username: 'jake',
          password: 'jakejake',
        },
      })
      .expect(422);

    const body = response.body as { errors: Record<string, string[]> };
    expect(body.errors.error).toContain('Email is already taken');
  });

  it('POST /api/users/login maps invalid credentials to 403', async () => {
    loginUserPort.execute.mockRejectedValue(new InvalidCredentialsException());

    const response = await request(app.getHttpServer())
      .post('/api/users/login')
      .send({
        user: {
          email: 'jake@jake.jake',
          password: 'wrong',
        },
      })
      .expect(403);

    const body = response.body as { errors: Record<string, string[]> };
    expect(body.errors.error).toContain('Email or password is invalid');
  });
});