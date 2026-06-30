import { registerAs } from '@nestjs/config';

const isProduction = process.env.NODE_ENV === 'production';

export default registerAs('swagger', () => ({
  enabled:
    (process.env.SWAGGER_ENABLED ?? (!isProduction).toString()) === 'true',
  path: process.env.SWAGGER_PATH ?? 'api/docs',
  title: process.env.SWAGGER_TITLE ?? 'Conduit API',
  description:
    process.env.SWAGGER_DESCRIPTION ??
    'RealWorld Medium clone backend (NestJS tutorial)',
  version: process.env.SWAGGER_VERSION ?? '1.0',
}));
