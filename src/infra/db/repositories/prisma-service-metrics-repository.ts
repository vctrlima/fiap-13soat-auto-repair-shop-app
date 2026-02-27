import { GetAllServiceMetricsRepository, GetServiceMetricsByIdRepository } from '@/application/protocols/db';
import { ServiceMetrics } from '@/domain/entities';
import { OrderDirection } from '@/domain/types';
import { MetricDateRange, ServiceMetricsRepositoryType } from '@/infra/db/types';
import { NotFoundError } from '@/presentation/errors';
import { PrismaClient } from '@prisma/client';

type ServiceMetricsRepository = GetAllServiceMetricsRepository & GetServiceMetricsByIdRepository;

export class PrismaServiceMetricsRepository implements ServiceMetricsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async getAll(
    params: GetAllServiceMetricsRepository.Params
  ): Promise<GetAllServiceMetricsRepository.Result> {
    const { page, limit, orderBy = 'createdAt', orderDirection = OrderDirection.DESC, serviceId } = params;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (serviceId) {
      where.serviceId = serviceId;
    }

    const servicesWithMetrics = await this.prisma.service.findMany({
      skip,
      take: limit,
      where: serviceId ? { id: serviceId } : {},
      include: {
        ServiceMetrics: {
          where: {
            finishedAt: { not: null },
          },
          select: {
            startedAt: true,
            finishedAt: true,
          },
        },
      },
      orderBy: { [orderBy]: orderDirection },
    });

    const total = await this.prisma.service.count({
      where: serviceId ? { id: serviceId } : {},
    });

    const content: ServiceMetrics[] = servicesWithMetrics.map((service: ServiceMetricsRepositoryType) => {
      let averageExecutionTimeInMinutes = 0;

      if (service.ServiceMetrics.length > 0) {
        const totalExecutionTime = service.ServiceMetrics.reduce((sum: number, metric: MetricDateRange) => {
          if (metric.finishedAt && metric.startedAt) {
            const executionTimeMs = metric.finishedAt.getTime() - metric.startedAt.getTime();
            return sum + executionTimeMs;
          }
          return sum;
        }, 0);

        averageExecutionTimeInMinutes = totalExecutionTime / (service.ServiceMetrics.length * 60 * 1000);
      }

      return {
        service: {
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        },
        averageExecutionTimeInMinutes: Math.round(averageExecutionTimeInMinutes * 100) / 100,
      };
    });

    return {
      content,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async getById(
    params: GetServiceMetricsByIdRepository.Params
  ): Promise<GetServiceMetricsByIdRepository.Result> {
    const { id: serviceId } = params;
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        ServiceMetrics: {
          where: {
            finishedAt: { not: null },
          },
          select: {
            startedAt: true,
            finishedAt: true,
          },
        },
      },
    });

    if (!service) throw new NotFoundError('Service not found');

    let averageExecutionTimeInMinutes = 0;
    if (service.ServiceMetrics.length > 0) {
      const totalExecutionTime = service.ServiceMetrics.reduce((sum: number, metric: MetricDateRange) => {
        if (metric.finishedAt && metric.startedAt) {
          const executionTimeMs = metric.finishedAt.getTime() - metric.startedAt.getTime();
          return sum + executionTimeMs;
        }
        return sum;
      }, 0);

      averageExecutionTimeInMinutes = totalExecutionTime / (service.ServiceMetrics.length * 60 * 1000);
    }

    return {
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      },
      averageExecutionTimeInMinutes: Math.round(averageExecutionTimeInMinutes * 100) / 100,
    };
  }
}
