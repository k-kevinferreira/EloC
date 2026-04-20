import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthenticatedAdmin } from '../interfaces/authenticated-admin.interface';

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedAdmin => {
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedAdmin }>();

    if (!request.user) {
      throw new UnauthorizedException('Authenticated admin was not resolved.');
    }

    return request.user;
  },
);
