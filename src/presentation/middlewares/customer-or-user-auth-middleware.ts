import { User } from "@/domain/entities";
import { GetCustomerByToken, GetUserByToken } from "@/domain/use-cases";
import { AccessDeniedError } from "@/presentation/errors";
import { Middleware } from "@/presentation/protocols";

export class CustomerOrUserAuthMiddleware implements Middleware {
  constructor(
    private readonly getUserByToken: GetUserByToken,
    private readonly getCustomerByToken: GetCustomerByToken,
  ) {}

  async handle(
    request: CustomerOrUserAuthMiddleware.Request,
  ): Promise<CustomerOrUserAuthMiddleware.Response> {
    try {
      const { authorization } = request;
      if (!authorization) throw new AccessDeniedError();
      const token = authorization.replace("Bearer ", "");

      try {
        const customer = await this.getCustomerByToken.getByToken({ token });
        return { id: customer.id, name: customer.name, email: customer.email };
      } catch {
        console.log("Not a customer token, trying user token...");
      }

      const user = await this.getUserByToken.getByToken({ token });
      if (!user) throw new AccessDeniedError();
      return user;
    } catch (error) {
      console.error(error);
      throw new AccessDeniedError();
    }
  }
}

export namespace CustomerOrUserAuthMiddleware {
  export type Request = { authorization?: string };
  export type Response = Partial<User>;
}
