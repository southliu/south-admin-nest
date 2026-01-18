import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserInfo {
  id: number;
  username: string;
  name?: string;
  email?: string;
  phone?: string;
  status: number;
}

export const CurrentUser = createParamDecorator(
  (data: keyof UserInfo | undefined, ctx: ExecutionContext): UserInfo | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
