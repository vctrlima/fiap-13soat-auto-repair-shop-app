import { GetServiceMetricsByIdRepository } from '@/application/protocols/db';
import { GetServiceMetricsById } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetServiceMetricsById } from './db-get-service-metrics-by-id';

describe('DbGetServiceMetricsById', () => {
  let sut: DbGetServiceMetricsById;
  let getServiceMetricsByIdRepositoryStub: jest.Mocked<GetServiceMetricsByIdRepository>;

  const mockResult: GetServiceMetricsById.Result = {
    service: {
      id: faker.string.uuid(),
      name: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      price: 50.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    averageExecutionTimeInMinutes: 30,
  };

  beforeEach(() => {
    getServiceMetricsByIdRepositoryStub = {
      getById: jest.fn(),
    };
    sut = new DbGetServiceMetricsById(getServiceMetricsByIdRepositoryStub);
  });

  describe('getById', () => {
    it('should call GetServiceMetricsByIdRepository with correct params', async () => {
      const params = { id: faker.string.uuid() };
      getServiceMetricsByIdRepositoryStub.getById.mockResolvedValueOnce(mockResult);

      await sut.getById(params);

      expect(getServiceMetricsByIdRepositoryStub.getById).toHaveBeenCalledWith(params);
      expect(getServiceMetricsByIdRepositoryStub.getById).toHaveBeenCalledTimes(1);
    });

    it('should return service metrics on success', async () => {
      const params = { id: faker.string.uuid() };
      getServiceMetricsByIdRepositoryStub.getById.mockResolvedValueOnce(mockResult);

      const result = await sut.getById(params);

      expect(result).toEqual(mockResult);
    });

    it('should return null when service metrics is not found', async () => {
      const params = { id: faker.string.uuid() };
      getServiceMetricsByIdRepositoryStub.getById.mockResolvedValueOnce(null as any);

      const result = await sut.getById(params);

      expect(result).toBeNull();
    });

    it('should throw when GetServiceMetricsByIdRepository throws', async () => {
      const params = { id: faker.string.uuid() };
      const error = new Error('Repository error');
      getServiceMetricsByIdRepositoryStub.getById.mockRejectedValueOnce(error);

      const promise = sut.getById(params);

      await expect(promise).rejects.toThrow(error);
    });
  });
});
