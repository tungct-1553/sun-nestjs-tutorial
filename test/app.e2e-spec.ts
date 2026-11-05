import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nValidationPipe } from 'nestjs-i18n';
import request from 'supertest';
import { App } from 'supertest/types';
import appConfig from '@main/config/app.config';
import i18nConfig from '@main/config/i18n.config';
import { HealthApiModule } from '@main/modules/health/health.api.module';
import { I18nAppModule } from '@main/i18n.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig, i18nConfig],
        }),
        I18nAppModule,
        HealthApiModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
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
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as { status: string; timestamp: string };
        expect(body.status).toBe('ok');
        expect(body.timestamp).toBeDefined();
      });
  });
});
