import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      return true;
    }

    return super.canActivate(context);
  }

  override handleRequest<TUser>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser | null {
    if (err || !user) {
      return null;
    }

    return user;
  }
}