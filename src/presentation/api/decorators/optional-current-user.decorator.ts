import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestUser } from '@presentation/api/decorators/current-user.decorator';

export const OptionalCurrentUser = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): AuthenticatedRequestUser | null => {
    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedRequestUser;
    }>();
    return request.user ?? null;
  },
);