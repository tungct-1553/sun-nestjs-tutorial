import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  I18nContext,
  I18nService,
  I18nValidationError,
  I18nValidationException,
} from 'nestjs-i18n';
import { ErrorResponseDto } from '@presentation/api/dtos/common/error-response.dto';

@Catch(I18nValidationException)
export class AuthValidationFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  catch(exception: I18nValidationException, host: ArgumentsHost): void {
    const errors: Record<string, string[]> = Object.create(null) as Record<
      string,
      string[]
    >;
    const lang = I18nContext.current(host)?.lang ?? 'en';
    this.collectErrors(
      exception.errors,
      errors,
      lang,
      exception.errorsAlreadyTranslated,
    );
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json(new ErrorResponseDto(errors));
  }

  private collectErrors(
    entries: I18nValidationError[],
    output: Record<string, string[]>,
    lang: string,
    translated: boolean,
    parent = '',
  ): void {
    for (const entry of entries) {
      const field = parent ? `${parent}.${entry.property}` : entry.property;
      const messages = Object.values(entry.constraints ?? {}).map((message) => {
        if (translated) return message;
        const key = message.split('|', 1)[0];
        return String(this.i18n.translate(key, { lang }));
      });
      if (messages.length) output[field] = messages;
      this.collectErrors(entry.children ?? [], output, lang, translated, field);
    }
  }
}
