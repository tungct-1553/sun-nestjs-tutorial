import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DomainException } from '@domain/exceptions/domain.exception';
import { DuplicateEmailException } from '@domain/exceptions/duplicate-email.exception';
import { DuplicateUsernameException } from '@domain/exceptions/duplicate-username.exception';
import { InvalidCredentialsException } from '@domain/exceptions/invalid-credentials.exception';
import { InternalException } from '@domain/exceptions/internal.exception';
import { TranslatableException } from '@domain/exceptions/translatable.exception';
import { UnauthorizedException } from '@domain/exceptions/unauthorized.exception';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';
import { ErrorResponseDto } from '@presentation/api/dtos/common/error-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly i18nService: I18nService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, errors } = this.resolveException(exception, request, host);

    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      const logTarget = this.resolveLogTarget(exception);

      this.logger.error(
        `${request.method} ${request.url}`,
        logTarget instanceof Error ? logTarget.stack : String(logTarget),
      );
    }

    response.status(status).json(new ErrorResponseDto(errors));
  }

  private resolveException(
    exception: unknown,
    request: Request,
    host: ArgumentsHost,
  ): {
    status: number;
    errors: Record<string, string[]>;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const body = exceptionResponse as Record<string, unknown>;

        if (Array.isArray(body.message)) {
          return {
            status,
            errors: {
              error: body.message.map((message) =>
                this.translate(String(message), request, host),
              ),
            },
          };
        }

        if (typeof body.message === 'string') {
          return {
            status,
            errors: {
              error: [this.translate(body.message, request, host)],
            },
          };
        }
      }

      return {
        status,
        errors: { error: [this.translate(exception.message, request, host)] },
      };
    }

    if (exception instanceof DomainException) {
      const status = this.resolveDomainExceptionStatus(exception);
      const message = this.resolveDomainExceptionMessage(
        exception,
        request,
        host,
      );

      return {
        status,
        errors: { error: [message] },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      errors: {
        error: [
          this.translate('errors.common.internal_server_error', request, host),
        ],
      },
    };
  }

  private resolveDomainExceptionStatus(exception: DomainException): number {
    if (exception instanceof InvalidCredentialsException) {
      return HttpStatus.FORBIDDEN;
    }

    if (
      exception instanceof DuplicateEmailException ||
      exception instanceof DuplicateUsernameException
    ) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }

    if (exception instanceof UnauthorizedException) {
      return HttpStatus.UNAUTHORIZED;
    }

    if (exception instanceof UserNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }

    if (exception instanceof InternalException) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return HttpStatus.BAD_REQUEST;
  }

  private resolveDomainExceptionMessage(
    exception: DomainException,
    request: Request,
    host: ArgumentsHost,
  ): string {
    if (exception instanceof TranslatableException) {
      return this.translate(
        exception.translationKey,
        request,
        host,
        exception.translationArgs,
      );
    }

    return this.translate(exception.message, request, host);
  }

  private resolveLogTarget(exception: unknown): unknown {
    if (exception instanceof InternalException && exception.cause) {
      return exception.cause;
    }

    return exception;
  }

  private resolveLanguage(request: Request, host: ArgumentsHost): string {
    const i18nContext = I18nContext.current(host);
    if (i18nContext?.lang) {
      return i18nContext.lang;
    }

    const queryLang = request.query.lang;
    if (typeof queryLang === 'string' && queryLang.length > 0) {
      return queryLang;
    }

    const headerLang = request.headers['x-lang'];
    if (typeof headerLang === 'string' && headerLang.length > 0) {
      return headerLang;
    }

    const acceptLanguage = request.headers['accept-language'];
    if (typeof acceptLanguage === 'string') {
      const primary = acceptLanguage.split(',')[0]?.trim().split('-')[0];
      if (primary) {
        return primary;
      }
    }

    return 'en';
  }

  private translate(
    key: string,
    request: Request,
    host: ArgumentsHost,
    args?: Record<string, string | number>,
  ): string {
    return this.i18nService.translate(key, {
      lang: this.resolveLanguage(request, host),
      args,
    });
  }
}