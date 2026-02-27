import { buildMiddleware } from '@/main/adapters';
import { makeAuthMiddleware } from '@/main/factories/middlewares';

export const authMiddleware = buildMiddleware(makeAuthMiddleware());
