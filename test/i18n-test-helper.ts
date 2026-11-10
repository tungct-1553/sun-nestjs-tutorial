import { I18nService } from 'nestjs-i18n';

const translations: Record<string, string> = {
  'errors.auth.email_taken': 'Email is already taken',
  'errors.auth.invalid_credentials': 'Email or password is invalid',
  'errors.auth.username_taken': 'Username is already taken',
  'errors.user.not_found': 'User not found',
};

export const testI18nService = {
  translate: (key: string): string => translations[key] ?? key,
} as I18nService;
