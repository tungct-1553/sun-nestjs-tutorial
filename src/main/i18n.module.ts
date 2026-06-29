import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule as NestI18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';

@Module({
  imports: [
    NestI18nModule.forRootAsync({
      inject: [ConfigService],
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get<string>(
          'i18n.fallbackLanguage',
          'en',
        ),
        loaderOptions: {
          path: join(__dirname, '../i18n'),
          watch: configService.get<string>('app.nodeEnv') === 'development',
        },
      }),
    }),
  ],
  exports: [NestI18nModule],
})
export class I18nAppModule {}
