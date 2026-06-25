import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '@domain/exceptions/domain.exception';
import { ErrorResponseDto } from '@presentation/api/dtos/common/error-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, errors } = this.resolveException(exception);

    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(new ErrorResponseDto(errors));
  }

  private resolveException(exception: unknown): {
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
            errors: { error: body.message.map(String) },
          };
        }

        if (typeof body.message === 'string') {
          return {
            status,
            errors: { error: [body.message] },
          };
        }
      }

      return {
        status,
        errors: { error: [exception.message] },
      };
    }

    if (exception instanceof DomainException) {
      // TODO: Handle domain exceptions and map them to appropriate HTTP status codes and error messages
      return {
        status: HttpStatus.BAD_REQUEST,
        errors: { error: [exception.message] },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      errors: { error: ['Internal server error'] },
    };
  }
}
