import { makeGetUserByToken } from '@/main/factories/use-cases';
import { OptionalAuthMiddleware } from '@/presentation/middlewares';
import { Middleware } from '@/presentation/protocols';

export const makeOptionalAuthMiddleware = (): Middleware => new OptionalAuthMiddleware(makeGetUserByToken());
