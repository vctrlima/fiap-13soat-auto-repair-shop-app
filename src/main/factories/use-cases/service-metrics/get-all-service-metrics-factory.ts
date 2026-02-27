import { DbGetAllServiceMetrics } from '@/application/use-cases';
import { GetAllServiceMetrics } from '@/domain/use-cases';
import { PrismaServiceMetricsRepository, prisma } from '@/infra/db';

export const makeGetAllServiceMetrics = (): GetAllServiceMetrics => {
  const prismaServiceMetricsRepository = new PrismaServiceMetricsRepository(prisma);
  return new DbGetAllServiceMetrics(prismaServiceMetricsRepository);
};
