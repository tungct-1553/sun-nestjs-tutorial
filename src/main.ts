import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { I18nValidationPipe } from 'nestjs-i18n';
import { AppModule } from '@main/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix(configService.get<string>('app.apiPrefix', 'api'));
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
}

void bootstrap();
