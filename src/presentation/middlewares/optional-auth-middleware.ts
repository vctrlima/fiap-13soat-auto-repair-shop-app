import { User } from '@/domain/entities';
import { GetUserByToken } from '@/domain/use-cases';
import { Middleware } from '@/presentation/protocols';

export class OptionalAuthMiddleware implements Middleware {
  constructor(private readonly getUserByToken: GetUserByToken) {}

  async handle(request: OptionalAuthMiddleware.Request): Promise<OptionalAuthMiddleware.Response> {
    try {
      if (!request.authorization) return;
      const { authorization } = request;
      const token = authorization.replace('Bearer ', '');
      const user = await this.getUserByToken.getByToken({ token });
      if (!user) return;
    } catch {
      return;
    }
  }
}

export namespace OptionalAuthMiddleware {
  export type Request = { authorization?: string };
  export type Response = Omit<User, 'password'> | void;
}
