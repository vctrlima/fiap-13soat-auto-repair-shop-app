import { GetAllServiceMetricsRepository } from '@/application/protocols/db';
import { GetAllServiceMetrics } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetAllServiceMetrics } from './db-get-all-service-metrics';

describe('DbGetAllServiceMetrics', () => {
  let sut: DbGetAllServiceMetrics;
  let getAllServiceMetricsRepositoryStub: jest.Mocked<GetAllServiceMetricsRepository>;

  const mockResult: GetAllServiceMetrics.Result = {
    content: [
      {
        service: {
          id: faker.string.uuid(),
          name: faker.lorem.words(3),
          description: faker.lorem.sentence(),
          price: 50.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        averageExecutionTimeInMinutes: 30,
      },
      {
        service: {
          id: faker.string.uuid(),
          name: faker.lorem.words(3),
          description: faker.lorem.sentence(),
          price: 75.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        averageExecutionTimeInMinutes: 45,
      },
    ],
    limit: 10,
    page: 1,
    totalPages: 1,
    total: 2,
  };

  beforeEach(() => {
    getAllServiceMetricsRepositoryStub = {
      getAll: jest.fn(),
    };
    sut = new DbGetAllServiceMetrics(getAllServiceMetricsRepositoryStub);
  });

  describe('getAll', () => {
    it('should call GetAllServiceMetricsRepository with correct params', async () => {
      const params = { page: 1, limit: 10 };
      getAllServiceMetricsRepositoryStub.getAll.mockResolvedValueOnce(mockResult);

      await sut.getAll(params);

      expect(getAllServiceMetricsRepositoryStub.getAll).toHaveBeenCalledWith(params);
      expect(getAllServiceMetricsRepositoryStub.getAll).toHaveBeenCalledTimes(1);
    });

    it('should return service metrics on success', async () => {
      const params = { page: 1, limit: 10 };
      getAllServiceMetricsRepositoryStub.getAll.mockResolvedValueOnce(mockResult);

      const result = await sut.getAll(params);

      expect(result).toEqual(mockResult);
    });

    it('should throw when GetAllServiceMetricsRepository throws', async () => {
      const params = { page: 1, limit: 10 };
      const error = new Error('Repository error');
      getAllServiceMetricsRepositoryStub.getAll.mockRejectedValueOnce(error);

      const promise = sut.getAll(params);

      await expect(promise).rejects.toThrow(error);
    });
  });
});
