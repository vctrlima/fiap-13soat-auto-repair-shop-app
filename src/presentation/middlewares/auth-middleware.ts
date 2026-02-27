import { User } from '@/domain/entities';
import { GetUserByToken } from '@/domain/use-cases';
import { AccessDeniedError } from '@/presentation/errors';
import { Middleware } from '@/presentation/protocols';

export class AuthMiddleware implements Middleware {
  constructor(private readonly getUserByToken: GetUserByToken) {}

  async handle(request: AuthMiddleware.Request): Promise<AuthMiddleware.Response> {
    try {
      const { authorization } = request;
      if (!authorization) throw new AccessDeniedError();
      const token = authorization.replace('Bearer ', '');
      const user = await this.getUserByToken.getByToken({ token });
      if (!user) throw new AccessDeniedError();
      return user;
    } catch (error: any) {
      console.error(error);
      throw new AccessDeniedError();
    }
  }
}

export namespace AuthMiddleware {
  export type Request = { authorization?: string };
  export type Response = Partial<User>;
}
