import { OrderDirection } from '@/domain/types';
import { NotFoundError } from '@/presentation/errors';
import { faker } from '@faker-js/faker';
import { PrismaServiceMetricsRepository } from './prisma-service-metrics-repository';

describe('PrismaServiceMetricsRepository', () => {
  let repository: PrismaServiceMetricsRepository;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      service: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    repository = new PrismaServiceMetricsRepository(prismaMock);
  });

  describe('getAll', () => {
    it('should return paginated service metrics with calculated averages', async () => {
      const mockServices = [
        {
          id: faker.string.uuid(),
          name: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          price: parseFloat(faker.commerce.price()),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          ServiceMetrics: [
            {
              startedAt: new Date('2023-01-01T10:00:00Z'),
              finishedAt: new Date('2023-01-01T12:00:00Z'),
            },
            {
              startedAt: new Date('2023-01-02T10:00:00Z'),
              finishedAt: new Date('2023-01-02T11:00:00Z'),
            },
          ],
        },
      ];

      prismaMock.service.findMany.mockResolvedValue(mockServices);
      (prismaMock.service.count as jest.Mock).mockResolvedValue(1);

      const params = {
        page: 1,
        limit: 10,
        orderBy: 'createdAt' as const,
        orderDirection: OrderDirection.DESC,
      };

      const result = await repository.getAll(params);

      expect(prismaMock.service.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
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
        orderBy: { createdAt: OrderDirection.DESC },
      });

      expect(result).toEqual({
        content: [
          {
            service: {
              id: mockServices[0].id,
              name: mockServices[0].name,
              description: mockServices[0].description,
              price: mockServices[0].price,
              createdAt: mockServices[0].createdAt,
              updatedAt: mockServices[0].updatedAt,
            },
            averageExecutionTimeInMinutes: 90,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter by serviceId when provided', async () => {
      const serviceId = faker.string.uuid();
      const mockServices: any[] = [];

      prismaMock.service.findMany.mockResolvedValue(mockServices);
      (prismaMock.service.count as jest.Mock).mockResolvedValue(0);

      const params = {
        page: 1,
        limit: 10,
        serviceId,
      };

      await repository.getAll(params);

      expect(prismaMock.service.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
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
        orderBy: { createdAt: OrderDirection.DESC },
      });
    });

    it('should return zero average when no metrics data exists', async () => {
      const mockServices = [
        {
          id: faker.string.uuid(),
          name: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          price: parseFloat(faker.commerce.price()),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          ServiceMetrics: [],
        },
      ];

      prismaMock.service.findMany.mockResolvedValue(mockServices);
      prismaMock.service.count.mockResolvedValue(1);

      const params = {
        page: 1,
        limit: 10,
      };

      const result = await repository.getAll(params);

      expect(result.content[0].averageExecutionTimeInMinutes).toBe(0);
    });

    it('should handle pagination correctly', async () => {
      prismaMock.service.findMany.mockResolvedValue([]);
      (prismaMock.service.count as jest.Mock).mockResolvedValue(25);

      const params = {
        page: 3,
        limit: 5,
      };

      await repository.getAll(params);

      expect(prismaMock.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 5,
        })
      );
    });
  });

  describe('getById', () => {
    it('should return service metrics for existing service', async () => {
      const serviceId = faker.string.uuid();
      const mockService = {
        id: serviceId,
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: parseFloat(faker.commerce.price()),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        ServiceMetrics: [
          {
            startedAt: new Date('2023-01-01T10:00:00Z'),
            finishedAt: new Date('2023-01-01T11:30:00Z'),
          },
        ],
      };

      prismaMock.service.findUnique.mockResolvedValue(mockService);

      const result = await repository.getById({ id: serviceId });

      expect(prismaMock.service.findUnique).toHaveBeenCalledWith({
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

      expect(result).toEqual({
        service: {
          id: mockService.id,
          name: mockService.name,
          description: mockService.description,
          price: mockService.price,
          createdAt: mockService.createdAt,
          updatedAt: mockService.updatedAt,
        },
        averageExecutionTimeInMinutes: 90,
      });
    });

    it('should throw NotFoundError when service does not exist', async () => {
      const serviceId = faker.string.uuid();

      prismaMock.service.findUnique.mockResolvedValue(null);

      await expect(repository.getById({ id: serviceId })).rejects.toThrow(
        new NotFoundError('Service not found')
      );
    });

    it('should return zero average when no metrics data exists for service', async () => {
      const serviceId = faker.string.uuid();
      const mockService = {
        id: serviceId,
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: parseFloat(faker.commerce.price()),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        ServiceMetrics: [],
      };

      prismaMock.service.findUnique.mockResolvedValue(mockService);

      const result = await repository.getById({ id: serviceId });

      expect(result.averageExecutionTimeInMinutes).toBe(0);
    });

    it('should handle multiple metrics records and calculate average correctly', async () => {
      const serviceId = faker.string.uuid();
      const mockService = {
        id: serviceId,
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: parseFloat(faker.commerce.price()),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        ServiceMetrics: [
          {
            startedAt: new Date('2023-01-01T10:00:00Z'),
            finishedAt: new Date('2023-01-01T12:00:00Z'),
          },
          {
            startedAt: new Date('2023-01-02T09:00:00Z'),
            finishedAt: new Date('2023-01-02T10:00:00Z'),
          },
          {
            startedAt: new Date('2023-01-03T14:00:00Z'),
            finishedAt: new Date('2023-01-03T16:30:00Z'),
          },
        ],
      };

      prismaMock.service.findUnique.mockResolvedValue(mockService);

      const result = await repository.getById({ id: serviceId });

      expect(result.averageExecutionTimeInMinutes).toBe(110);
    });

    it('should round average execution time to 2 decimal places', async () => {
      const serviceId = faker.string.uuid();
      const mockService = {
        id: serviceId,
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: parseFloat(faker.commerce.price()),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        ServiceMetrics: [
          {
            startedAt: new Date('2023-01-01T10:00:00Z'),
            finishedAt: new Date('2023-01-01T10:10:00Z'),
          },
          {
            startedAt: new Date('2023-01-02T10:00:00Z'),
            finishedAt: new Date('2023-01-02T10:11:00Z'),
          },
          {
            startedAt: new Date('2023-01-03T10:00:00Z'),
            finishedAt: new Date('2023-01-03T10:12:00Z'),
          },
        ],
      };

      prismaMock.service.findUnique.mockResolvedValue(mockService);

      const result = await repository.getById({ id: serviceId });

      expect(result.averageExecutionTimeInMinutes).toBe(11);
    });
  });
});
