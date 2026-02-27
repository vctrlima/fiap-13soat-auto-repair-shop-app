import { DbGetServiceMetricsById } from '@/application/use-cases';
import { GetServiceMetricsById } from '@/domain/use-cases';
import { PrismaServiceMetricsRepository, prisma } from '@/infra/db';

export const makeGetServiceMetricsById = (): GetServiceMetricsById => {
  const prismaServiceMetricsRepository = new PrismaServiceMetricsRepository(prisma);
  return new DbGetServiceMetricsById(prismaServiceMetricsRepository);
};
