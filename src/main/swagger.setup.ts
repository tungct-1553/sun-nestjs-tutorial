import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication): void => {
  const configService = app.get(ConfigService);

  if (!configService.get<boolean>('swagger.enabled')) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('swagger.title', 'Conduit API'))
    .setDescription(
      configService.get<string>(
        'swagger.description',
        'RealWorld Medium clone backend',
      ),
    )
    .setVersion(configService.get<string>('swagger.version', '1.0'))
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'RealWorld JWT auth. Format: `Token <jwt>`',
      },
      'token',
    )
    .addGlobalParameters({
      name: 'Accept-Language',
      in: 'header',
      required: false,
      description: 'Response language for errors (e.g. en, vi)',
      schema: { type: 'string', example: 'vi' },
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const path = configService.get<string>('swagger.path', 'api/docs');

  SwaggerModule.setup(path, app, document);
};
