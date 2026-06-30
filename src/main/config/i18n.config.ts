import { registerAs } from '@nestjs/config';

export default registerAs('i18n', () => ({
  fallbackLanguage: process.env.I18N_FALLBACK_LANGUAGE ?? 'en',
}));
