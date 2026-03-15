import { buildMiddleware } from "@/main/adapters";
import { makeCustomerOrUserAuthMiddleware } from "@/main/factories/middlewares";

export const customerOrUserAuthMiddleware = buildMiddleware(
  makeCustomerOrUserAuthMiddleware(),
);
