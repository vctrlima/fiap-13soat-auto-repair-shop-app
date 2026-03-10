import {
  makeGetCustomerByToken,
  makeGetUserByToken,
} from "@/main/factories/use-cases";
import { CustomerOrUserAuthMiddleware } from "@/presentation/middlewares";
import { Middleware } from "@/presentation/protocols";

export const makeCustomerOrUserAuthMiddleware = (): Middleware =>
  new CustomerOrUserAuthMiddleware(
    makeGetUserByToken(),
    makeGetCustomerByToken(),
  );
