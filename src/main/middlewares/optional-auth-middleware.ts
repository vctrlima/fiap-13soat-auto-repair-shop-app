import { buildMiddleware } from '@/main/adapters';
import { makeOptionalAuthMiddleware } from '@/main/factories/middlewares';

export const optionalAuthMiddleware = buildMiddleware(makeOptionalAuthMiddleware());
